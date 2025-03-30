"""Chat functionality for the learning assistant."""

from typing import List, Dict
from .llm import llm, parse_llm_output

def get_chat_prompt(context: str) -> str:
    """Generate the chat prompt with context."""
    return f'''You are an AI learning assistant helping a student learn about a specific topic.

CONTEXT:
{context}

Remember to:
1. Use the context to personalize explanations
2. Keep responses focused and engaging
3. Provide practical examples
4. Encourage active learning and critical thinking

Respond to the student's next message.
'''

def chat_with_assistant(context: str, message: str) -> str:
    """Chat with the learning assistant.
    
    Args:
        context (str): Complete context including learning plan, current chapter, and conversation history
        message (str): User's message to respond to
    
    Returns:
        str: Assistant's response
    """
    # Generate chat prompt
    prompt = get_chat_prompt(context)

    # Get response from LLM
    result = llm.invoke(prompt + f"\n\nStudent: {message}")
    return result.content
