from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union

class APIError(Exception):
    """Base exception for API errors"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class LLMParsingError(APIError):
    """Raised when the LLM output cannot be parsed"""
    pass

class ChapterContent(BaseModel):
    introduction: str = Field(..., description="Chapter objectives and importance")
    theory: str = Field(..., description="Clear explanation of essential concepts")
    guided_practice: str = Field(..., description="Step-by-step guided activity or tutorial")
    challenge: str = Field(..., description="Independent practice challenge")
    conclusion: str = Field(..., description="Summary and self-evaluation questions")
    resources: List[str] = Field(..., description="List of learning resources and references")

class Chapter(BaseModel):
    id: str = Field(..., description="Unique identifier for the chapter")
    title: str = Field(..., description="Chapter title")
    prerequisites: List[str] = Field(default_factory=list, description="List of prerequisite chapter IDs")
    content: Optional[ChapterContent] = Field(None, description="Detailed chapter content")

class LearningPlan(BaseModel):
    title: str = Field(..., description="Title of the learning plan")
    description: str = Field(..., description="Brief description of the learning plan")
    chapters: List[Chapter] = Field(..., description="List of chapters in the plan")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Découverte de Docker pour les débutants",
                "description": "Apprenez les bases de Docker en une semaine",
                "chapters": [
                    {
                        "id": "c1",
                        "title": "Introduction à Docker",
                        "prerequisites": [],
                        "content": None
                    }
                ]
            }
        }

class ContextRequest(BaseModel):
    subject: str = Field(..., description="The subject to learn about")

class PlanRequest(BaseModel):
    subject: str = Field(..., description="The subject to learn about")
    context: str = Field(..., description="Learning context and preferences")

class FeedbackRequest(BaseModel):
    context: str = Field(..., description="Original learning context")
    current_plan: LearningPlan = Field(..., description="Current learning plan")
    user_message: str = Field(..., description="User's feedback or question")
    conversation_history: List[str] = Field(default_factory=list, description="Previous conversation messages")

class ContentRequest(BaseModel):
    plan: LearningPlan = Field(..., description="The learning plan to generate content for")

class FeedbackResponse(BaseModel):
    response: str = Field(..., description="Assistant's response to the user")
    plan: Optional[LearningPlan] = Field(None, description="Modified learning plan, if any")

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    context: str = Field(..., description="Complete context including learning plan, current chapter, and conversation history")
    message: str = Field(..., description="User's message to respond to")

    class Config:
        json_schema_extra = {
            "example": {
                "context": "Learning Plan: Introduction to Python, Current Chapter: Variables and Data Types. Previous conversation: USER: What are variables? ASSISTANT: Variables are containers for storing data...",
                "message": "Can you give me an example?"
            }
        }

class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str = Field(..., description="Assistant's response to the user")
