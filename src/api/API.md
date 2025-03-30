# Learning Path Generator API

API service that generates personalized learning paths using LLMs.

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export MISTRAL_API_KEY=your_api_key_here
```

3. Run the server:
```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### 1. Generate Context Question
Generates a personalized question to gather learning context.

```http
POST /api/context
Content-Type: application/json

{
    "subject": "string"  // What you want to learn
}

Response: string (the context question)
```

### 2. Generate Learning Plan
Generates a structured learning plan based on subject and context.

```http
POST /api/plan
Content-Type: application/json

{
    "subject": "string",  // What you want to learn
    "context": "string"   // Your learning context
}

Response: LearningPlan object
```

### 3. Generate Chapter Contents
Generates detailed content for each chapter in a learning plan.

```http
POST /api/generate_content
Content-Type: application/json

{
    "plan": {                       // LearningPlan object
        "title": "string",
        "description": "string",
        "chapters": [
            {
                "id": "string",
                "title": "string",
                "prerequisites": ["string"],
            }
        ]
    }
}

Response: LearningPlan object with detailed chapter contents
```

### 3. Process Feedback
Enables conversational interaction with the learning plan. Users can ask questions, request modifications, or get clarification about any aspect of the plan.

```http
POST /api/feedback
Content-Type: application/json

{
    "context": "string",              // Original learning context
    "current_plan": LearningPlan,     // Current learning plan
    "user_message": "string",        // User's feedback or question
    "conversation_history": [         // Optional list of previous messages
        "string"
    ]
}

Response: {
    "response": "string",            // Assistant's response
    "plan": LearningPlan | null      // Modified plan or null if no changes
}
```

## Error Handling

The API uses HTTP status codes to indicate the success or failure of requests:

- `200 OK`: Request successful
- `422 Unprocessable Entity`: Invalid request format or LLM output parsing error
- `500 Internal Server Error`: Server-side error

### Error Response Format

```json
{
    "message": "string",           // Error description
    "details": {                   // Optional error details
        "error": "string",        // Technical error message
        "parsing_error": {        // For LLM parsing errors
            "output": "string"    // Raw LLM output
        }
    }
}
```

## Response Models

### LearningPlan
```json
{
    "title": "string",
    "description": "string",
    "chapters": [
        {
            "id": "string",
            "title": "string",
            "prerequisites": ["string"],
            "content": {
                "explanation": "string",
                "tips": "string",
                "resources": ["string"]
            }
        }
    ]
}
```

## Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t learning-path-api .
docker run -e MISTRAL_API_KEY=your_key -p 8000:8000 learning-path-api
```

### Production Tips
1. Use HTTPS in production
2. Set appropriate CORS origins
3. Add rate limiting
4. Use environment variables for configuration
5. Consider adding authentication

## Interactive Documentation
When the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
