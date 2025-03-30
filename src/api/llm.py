import os
from pathlib import Path
from langchain.prompts import PromptTemplate
from langchain_mistralai.chat_models import ChatMistralAI
from typing import Dict

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
