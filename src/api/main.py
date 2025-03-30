import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import (
    ContextRequest, PlanRequest, LearningPlan, ContentRequest,
    FeedbackRequest, FeedbackResponse, APIError, LLMParsingError,
    ChatRequest, ChatResponse, ChapterContent
)
from .chat import chat_with_assistant
from .llm import (
    context_chain, plan_chain, chapters_chain, feedback_chain,
    parse_plan_output, parse_feedback_output, parse_llm_output, try_parse_json
)

app = FastAPI(
    title="Learning Path Generator API",
    description="API for generating personalized learning paths using LLMs",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom error handler
@app.exception_handler(APIError)
async def api_error_handler(request, exc: APIError):
    return JSONResponse(
        status_code=422,
        content={
            "message": exc.message,
            "details": exc.details
        }
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with the learning assistant about the current topic."""
    try:
        # Get response from assistant with simplified context
        response = chat_with_assistant(
            context=request.context,
            message=request.message
        )
        
        return ChatResponse(response=response)
    except Exception as e:
        raise APIError(
            message="Failed to process chat message",
            details={"error": str(e)}
        )

@app.post("/api/context", response_model=str)
async def generate_context_question(request: ContextRequest) -> str:
    """Generate a context question based on the learning subject."""
    try:
        result = await context_chain.ainvoke({"subject": request.subject})
        return result.content
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to generate context question",
                "error": str(e)
            }
        )

@app.post("/api/plan", response_model=LearningPlan)
async def generate_learning_plan(request: PlanRequest) -> LearningPlan:
    """Generate a learning plan based on subject and context."""
    try:
        # Generate learning plan
        result = await plan_chain.ainvoke({
            "sujet": request.subject,
            "context": request.context
        })
        return parse_plan_output(result)
    except LLMParsingError as e:
        raise APIError(
            message="Failed to generate a valid learning plan",
            details={
                "error": str(e),
                "parsing_error": e.details
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unexpected error generating learning plan",
                "error": str(e)
            }
        )

@app.post("/api/generate_content", response_model=LearningPlan)
async def generate_content(request: ContentRequest) -> LearningPlan:
    """Generate detailed content for each chapter in the learning plan.
    
    This endpoint takes an existing learning plan and generates detailed content
    for each chapter in the plan.
    
    Example request:
    {
        "plan": {
            "title": "Docker Basics",
            "description": "Learn Docker fundamentals",
            "chapters": [
                {
                    "id": "c1",
                    "title": "Introduction",
                    "prerequisites": []
                }
            ]
        }
    }
    """
    try:
        # Generate all chapter contents
        result = await chapters_chain.ainvoke({
            "learning_plan": json.dumps(request.plan.model_dump(), ensure_ascii=False)
        })
        
        # Debug: Print raw LLM output
        print("Raw LLM output:")
        print(result.content)
        
        # Extract and parse the JSON content
        content = parse_llm_output(result.content)
        print("\nParsed content:")
        print(content)
        try:
            data = try_parse_json(content)
            
            # Validate the response structure
            if not isinstance(data, dict) or 'chapters' not in data or not isinstance(data['chapters'], list):
                raise ValueError("Invalid response structure: missing or invalid 'chapters' array")
            
            # Create a deep copy of the plan to avoid modifying the original
            updated_plan = request.plan.model_copy(deep=True)
            
            # Create a map of chapter IDs to their indices for faster lookup
            chapter_map = {chapter.id: i for i, chapter in enumerate(updated_plan.chapters)}
            
            # Get the original chapter IDs in order
            chapter_ids = [c.id for c in request.plan.chapters]
            
            # Process each chapter's content
            for i, chapter_data in enumerate(data['chapters']):
                # Validate chapter data structure
                if not isinstance(chapter_data, dict):
                    print(f"Invalid chapter data type: {type(chapter_data)}")
                    continue
                    
                chapter_content = chapter_data.get('content')
                if not chapter_content:
                    print(f"Missing content for chapter")
                    continue
                
                # Map the chapter to the correct ID from the plan
                if i < len(chapter_ids):
                    chapter_id = chapter_ids[i]
                    chapter_data['id'] = chapter_id
                else:
                    print(f"Extra chapter content ignored")
                    continue
                
                print(f"\nProcessing chapter {chapter_id}")
                print("Content:", json.dumps(chapter_content, indent=2))
                
                # Find and update the chapter if it exists in our plan
                if chapter_id in chapter_map:
                    try:
                        print(f"Validating content against ChapterContent model...")
                        validated_content = ChapterContent.model_validate(chapter_content)
                        print("Content validation successful")
                        updated_plan.chapters[chapter_map[chapter_id]].content = validated_content
                    except Exception as e:
                        print(f"Error validating content for chapter {chapter_id}: {str(e)}")
                        raise ValueError(f"Invalid content structure for chapter {chapter_id}: {str(e)}")
                else:
                    print(f"Chapter {chapter_id} not found in plan")
            
            return updated_plan
            
        except ValueError as e:
            raise LLMParsingError(
                "Invalid or incomplete chapter contents",
                {"error": str(e), "output": content}
            )
        except Exception as e:
            raise LLMParsingError(
                "Failed to parse chapter contents",
                {"error": str(e), "output": content}
            )
    except LLMParsingError as e:
        raise APIError(
            message="Failed to generate valid chapter contents",
            details={
                "error": str(e),
                "parsing_error": e.details
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unexpected error generating chapter contents",
                "error": str(e)
            }
        )

@app.post("/api/feedback", response_model=FeedbackResponse)
async def process_feedback(request: FeedbackRequest) -> FeedbackResponse:
    """Process user feedback about the learning plan.
    
    This endpoint enables a conversational interaction where users can:
    1. Ask questions about specific chapters
    2. Request modifications to the plan
    3. Get clarification about any aspect of the plan
    
    The response will include the assistant's message and optionally a modified plan.
    """
    try:
        # Get feedback
        result = await feedback_chain.ainvoke({
            "context": request.context,
            "current_plan": json.dumps(request.current_plan.model_dump(), ensure_ascii=False),
            "user_message": request.user_message,
            "conversation_history": "\n".join(request.conversation_history)
        })
        return parse_feedback_output(result)
    except LLMParsingError as e:
        # If parsing fails but we have a response message, return it
        if "output" in e.details:
            return FeedbackResponse(response=e.details["output"].strip(), plan=None)
        raise APIError(
            message="Failed to process feedback",
            details={
                "error": str(e),
                "parsing_error": e.details
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unexpected error processing feedback",
                "error": str(e)
            }
        )
