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
    explanation: str = Field(..., description="Detailed explanation of the chapter content")
    tips: str = Field(..., description="Practical tips and advice for learning")
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

class Message(BaseModel):
    """A message in the conversation history"""
    role: str = Field(..., description="Role of the message sender (USER or ASSISTANT)")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    plan: LearningPlan = Field(..., description="Complete learning plan without chapter content")
    current_chapter: str = Field(..., description="ID of the current chapter")
    conversation_history: List[Message] = Field(default_factory=list, description="Previous conversation messages")
    message: str = Field(..., description="User's message to respond to")

    class Config:
        json_schema_extra = {
            "example": {
                "plan": {
                    "title": "Docker Basics",
                    "description": "Learn Docker fundamentals",
                    "chapters": [
                        {
                            "id": "c1",
                            "title": "Introduction to Docker",
                            "prerequisites": []
                        },
                        {
                            "id": "c2",
                            "title": "Docker Installation",
                            "prerequisites": ["c1"]
                        },
                        {
                            "id": "c3",
                            "title": "Docker Images and Containers",
                            "prerequisites": ["c2"]
                        }
                    ]
                },
                "current_chapter": "c2",
                "conversation_history": [
                    {"role": "ASSISTANT", "content": "Docker can be installed on various operating systems..."},
                    {"role": "USER", "content": "Ok but I didn't get the third fact"},
                    {"role": "ASSISTANT", "content": "The third fact was about..."}
                ],
                "message": "How do I check if Docker is installed correctly?"
            }
        }

class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str = Field(..., description="Assistant's response to the user")
    conversation_history: List[Message] = Field(..., description="Updated conversation history")
