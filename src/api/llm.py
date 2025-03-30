import os
from pathlib import Path
from langchain.prompts import PromptTemplate
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.output_parsers import PydanticOutputParser
from typing import Dict, Optional, Any, Union
from .models import LearningPlan, FeedbackResponse, LLMParsingError
import json
import re

# Initialize the Mistral LLM
llm = ChatMistralAI(
    mistral_api_key=os.environ.get("MISTRAL_API_KEY"),
    temperature=0.7
)

# Get paths to prompt files
prompts_dir = Path(__file__).parent.parent / 'prompts'
context_prompt_path = prompts_dir / 'prompt_context.txt'
plan_prompt_path = prompts_dir / 'prompt_plan.txt'
chapters_batch_prompt_path = prompts_dir / 'prompt_chapters_batch.txt'
feedback_prompt_path = prompts_dir / 'prompt_feedback.txt'

def read_prompt_template(file_path: str) -> str:
    """Read prompt template from file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

# Helper functions for parsing outputs
def repair_json(text: str) -> str:
    """Attempt to repair common JSON errors in LLM output."""
    # Remove any text before the first { or after the last }
    text = re.sub(r'^[^{]*', '', text)
    text = re.sub(r'[^}]*$', '', text)
    
    # Fix missing quotes around property names
    text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', text)
    
    # Fix single quotes to double quotes
    text = re.sub(r"'([^']*)':", r'"\1":', text)  # Fix property names
    text = re.sub(r":\s*'([^']*)'([,}])", r':"\1"\2', text)  # Fix string values
    
    # Fix trailing commas in objects/arrays
    text = re.sub(r',\s*([}\]])', r'\1', text)
    
    # Fix missing quotes around string values
    text = re.sub(r':\s*([a-zA-Z][^,}\]]*[,}\]])', lambda m: f':"{m.group(1).strip().rstrip(",}]")}]"', text)
    
    return text

def parse_llm_output(output: str) -> str:
    """Parse LLM output, handling potential markdown code blocks."""
    content = output.strip()
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
    return content

def try_parse_json(content: str) -> Dict[str, Any]:
    """Try to parse JSON with repair attempts."""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # First repair attempt
        try:
            repaired = repair_json(content)
            return json.loads(repaired)
        except json.JSONDecodeError as e:
            # If repair fails, try to extract any valid JSON substring
            matches = re.finditer(r'\{(?:[^{}]|\{[^{}]*\})*\}', content)
            for match in matches:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    continue
            raise e

def parse_plan_output(result) -> LearningPlan:
    """Parse LLM output into a LearningPlan object."""
    try:
        content = parse_llm_output(result.content)
        try:
            data = try_parse_json(content)
            # Ensure required fields exist
            if not data.get("title") or not data.get("description") or not data.get("chapters"):
                # Create minimal valid plan from content
                data = {
                    "title": data.get("title", "Learning Plan"),
                    "description": data.get("description", "Generated learning plan"),
                    "chapters": data.get("chapters", [])
                }
            return LearningPlan.model_validate(data)
        except Exception as e:
            # Last resort: create a minimal valid plan
            content_summary = result.content[:100] + "..." if len(result.content) > 100 else result.content
            return LearningPlan(
                title="Learning Plan (Recovered)",
                description=f"Plan generated from unstructured content: {content_summary}",
                chapters=[]
            )
    except Exception as e:
        raise LLMParsingError(
            "Failed to parse learning plan from LLM output",
            {"error": str(e), "output": result.content}
        )

def parse_feedback_output(result) -> FeedbackResponse:
    """Parse LLM output into a FeedbackResponse object."""
    try:
        content = parse_llm_output(result.content)
        try:
            data = try_parse_json(content)
            return FeedbackResponse(
                response=data.get("response", ""),
                plan=LearningPlan.model_validate(data["plan"]) if data.get("plan") else None
            )
        except Exception:
            # If JSON parsing fails completely, extract text response
            text = re.sub(r'```.*?```', '', content, flags=re.DOTALL)  # Remove code blocks
            text = re.sub(r'[\r\n]+', ' ', text)  # Normalize newlines
            text = text.strip()
            return FeedbackResponse(response=text, plan=None)
    except Exception as e:
        raise LLMParsingError(
            "Failed to parse feedback response from LLM output",
            {"error": str(e), "output": result.content}
        )

# Create the prompts
context_prompt = PromptTemplate(
    input_variables=["subject"],
    template=read_prompt_template(context_prompt_path)
)

plan_prompt = PromptTemplate(
    input_variables=["sujet", "context"],
    template=read_prompt_template(plan_prompt_path)
)

chapters_batch_prompt = PromptTemplate(
    input_variables=["learning_plan"],
    template=read_prompt_template(chapters_batch_prompt_path)
)

feedback_prompt = PromptTemplate(
    input_variables=["context", "current_plan", "user_message", "conversation_history"],
    template=read_prompt_template(feedback_prompt_path)
)

# Create the chains
context_chain = context_prompt | llm
plan_chain = plan_prompt | llm
chapters_chain = chapters_batch_prompt | llm
feedback_chain = feedback_prompt | llm
