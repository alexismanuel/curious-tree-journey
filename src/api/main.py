import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import (
    ContextRequest, PlanRequest, LearningPlan,
    FeedbackRequest, FeedbackResponse
)
from .llm import context_chain, plan_chain, chapters_chain, feedback_chain

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

@app.post("/api/context", response_model=str)
async def generate_context_question(request: ContextRequest) -> str:
    """Generate a context question based on the learning subject."""
    try:
        result = await context_chain.ainvoke({"subject": request.subject})
        return result.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/plan", response_model=LearningPlan)
async def generate_learning_plan(request: PlanRequest) -> LearningPlan:
    """Generate a learning plan based on subject and context."""
    try:
        # Generate learning plan
        plan_result = await plan_chain.ainvoke({
            "sujet": request.subject,
            "context": request.context
        })
        return LearningPlan.model_validate(json.loads(plan_result.content))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_content", response_model=LearningPlan)
async def generate_content(plan: LearningPlan) -> LearningPlan:
    """Generate detailed content for each chapter in the learning plan.
    
    This endpoint takes an existing learning plan and generates detailed content
    for each chapter in the plan.
    """
    try:
        # Generate all chapter contents in a single batch
        chapters_result = await chapters_chain.ainvoke({
            "learning_plan": json.dumps(plan.model_dump(), ensure_ascii=False)
        })
        chapters_content = json.loads(chapters_result.content)
        
        # Update each chapter with its content
        for chapter in plan.chapters:
            matching_content = next(
                (c for c in chapters_content["chapters"] if c["id"] == chapter.id),
                None
            )
            if matching_content:
                chapter.content = matching_content["content"]
        
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        # Get feedback from LLM
        result = await feedback_chain.ainvoke({
            "context": request.context,
            "current_plan": json.dumps(request.current_plan.model_dump(), ensure_ascii=False),
            "user_message": request.user_message,
            "conversation_history": "\n".join(request.conversation_history)
        })
        
        # Extract content and remove any extra whitespace/newlines
        content = result.content.strip()
        
        # Try to extract JSON from markdown code blocks if present
        if "```" in content:
            # Find the last JSON block (in case there are multiple)
            json_blocks = content.split("```")
            for block in reversed(json_blocks):
                if block.strip().startswith("json"):
                    content = block.replace("json", "", 1).strip()
                    break
                elif not block.strip():
                    continue
                else:
                    content = block.strip()
                    break
        
        try:
            # Parse the response
            feedback = json.loads(content)
            response = feedback["response"]
            new_plan = feedback.get("plan")
            
            # Convert new_plan to LearningPlan if it exists
            if new_plan:
                new_plan = LearningPlan.model_validate(new_plan)
            
            return FeedbackResponse(response=response, plan=new_plan)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return the raw content as response
            return FeedbackResponse(response=content, plan=None)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
