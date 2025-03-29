import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import ContextRequest, PlanRequest, LearningPlan
from .llm import context_chain, plan_chain, chapters_chain

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
        return json.loads(plan_result.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chapters", response_model=LearningPlan)
async def generate_chapter_contents(plan: LearningPlan) -> LearningPlan:
    """Generate detailed content for each chapter in the learning plan."""
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

@app.post("/api/generate", response_model=LearningPlan)
async def generate_complete_learning_path(request: PlanRequest) -> LearningPlan:
    """Generate a complete learning path including plan and chapter contents."""
    try:
        # Step 1: Generate learning plan
        plan = await generate_learning_plan(request)
        
        # Step 2: Generate chapter contents
        complete_plan = await generate_chapter_contents(plan)
        
        return complete_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
