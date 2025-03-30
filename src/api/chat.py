"""Chat functionality for the learning assistant."""

from typing import List, Dict
from .llm import llm, parse_llm_output

def get_chat_prompt(context: str, current_chapter: dict, prev_chapters: list, next_chapters: list, conversation_history: list) -> str:
    """Generate the chat prompt with context and learning progress."""
    # Format previous and next chapters for context
    prev_chapters_text = "\n".join([f"- {ch['title']}" for ch in prev_chapters]) if prev_chapters else "None"
    next_chapters_text = "\n".join([f"- {ch['title']}" for ch in next_chapters]) if next_chapters else "None"
    
    # Format conversation history
    history_text = ""
    if conversation_history:
        history_text = "\n" + "\n".join([f"{msg}" for msg in conversation_history])
    
    # Get chapter content safely
    content = current_chapter.get('content', {})
    if content is None:
        content = {}
    
    return f'''You are an AI learning assistant helping a student learn about a specific topic.

STUDENT CONTEXT:
{context}

CURRENT CHAPTER:
Title: {current_chapter['title']}
Content: {content.get('explanation', 'No content available')}
Tips: {content.get('tips', 'No tips available')}
Resources: {', '.join(content.get('resources', ['No resources available']))}

LEARNING PROGRESS:
Previously covered chapters:
{prev_chapters_text}

Upcoming chapters:
{next_chapters_text}

CONVERSATION HISTORY:{history_text}

Remember to:
1. Use the student's context to personalize explanations
2. Reference previous chapters when relevant
3. Prepare them for upcoming chapters
4. Keep responses focused and engaging
5. Provide practical examples
6. Encourage active learning and critical thinking

Respond to the student's next message.
'''

def chat_with_assistant(
    context: str,
    current_chapter: dict,
    prev_chapters: list,
    next_chapters: list,
    conversation_history: list,
    message: str
) -> str:
    """Chat with the learning assistant.
    
    Args:
        context (str): Learning context (e.g. plan description)
        current_chapter (dict): Current chapter details
        prev_chapters (list): List of completed chapters
        next_chapters (list): List of upcoming chapters
        conversation_history (list): Previous conversation messages with role and content
        message (str): User's message to respond to
    
    Returns:
        str: Assistant's response
    """
    # Extract message content from conversation history
    history_content = [f"{msg.role}: {msg.content}" for msg in conversation_history]
    
    # Generate chat prompt
    prompt = get_chat_prompt(
        context=context,
        current_chapter=current_chapter,
        prev_chapters=prev_chapters,
        next_chapters=next_chapters,
        conversation_history=history_content
    )

    # Get response from LLM
    result = llm.invoke(prompt + f"\n\nStudent: {message}")
    return result.content
