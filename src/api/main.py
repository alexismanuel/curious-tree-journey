import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import (
    ContextRequest, PlanRequest, LearningPlan, ContentRequest,
    FeedbackRequest, FeedbackResponse, APIError, LLMParsingError,
    ChatRequest, ChatResponse, Message
)
from .chat import chat_with_assistant
from .llm import (
    context_chain, plan_chain, chapters_chain, feedback_chain,
    parse_plan_output, parse_feedback_output
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
        # Find the current chapter object and extract prev/next chapters
        current_chapter = None
        prev_chapters = []
        next_chapters = []
        found_current = False
        
        for chapter in request.plan.chapters:
            if chapter.id == request.current_chapter:
                current_chapter = chapter
                found_current = True
            elif not found_current:
                prev_chapters.append(chapter)
            else:
                next_chapters.append(chapter)
        
        if not current_chapter:
            raise APIError(f"Current chapter {request.current_chapter} not found in plan")
        
        # Get response from assistant
        response = chat_with_assistant(
            context=request.plan.description,  # Use plan description as context
            current_chapter=current_chapter.dict(),
            prev_chapters=[ch.dict() for ch in prev_chapters],
            next_chapters=[ch.dict() for ch in next_chapters],
            conversation_history=request.conversation_history,
            message=request.message
        )
        
        # Update conversation history with the new exchange
        updated_history = list(request.conversation_history)
        updated_history.extend([
            Message(role="USER", content=request.message),
            Message(role="ASSISTANT", content=response)
        ])
        
        return ChatResponse(
            response=response,
            conversation_history=updated_history
        )
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
        return parse_plan_output(result)
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
