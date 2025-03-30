from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union

class ContextRequest(BaseModel):
    subject: str

class PlanRequest(BaseModel):
    subject: str
    context: str

class ChapterContent(BaseModel):
    explanation: str
    tips: str
    resources: List[str]

class Chapter(BaseModel):
    id: str
    title: str
    prerequisites: List[str]
    content: Optional[ChapterContent] = None

class LearningPlan(BaseModel):
    title: str
    description: str
    chapters: List[Chapter]

class FeedbackRequest(BaseModel):
    context: str
    current_plan: LearningPlan
    user_message: str
    conversation_history: List[str] = Field(default_factory=list)

class FeedbackResponse(BaseModel):
    response: str
    plan: Optional[LearningPlan] = None
