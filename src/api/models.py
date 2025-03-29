from pydantic import BaseModel
from typing import List, Dict, Optional

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
    id: str
    title: str
    description: str
    context: str
    chapters: List[Chapter]
