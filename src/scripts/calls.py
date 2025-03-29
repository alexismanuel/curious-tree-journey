import os
import json
from pathlib import Path
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_mistralai.chat_models import ChatMistralAI
from typing import Dict

# Initialize the Mistral LLM
llm = ChatMistralAI(
    mistral_api_key=os.environ.get("MISTRAL_API_KEY"),
    temperature=0.7
)

# Read prompt templates from files
def read_prompt_template(file_path: str) -> str:
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

# Get paths to prompt files
prompts_dir = Path(__file__).parent.parent / 'prompts'
context_prompt_path = prompts_dir / 'prompt_context.txt'
plan_prompt_path = prompts_dir / 'prompt_plan.txt'
chapters_batch_prompt_path = prompts_dir / 'prompt_chapters_batch.txt'

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

# Create the chains
context_chain = context_prompt | llm
plan_chain = plan_prompt | llm
chapters_chain = chapters_batch_prompt | llm

def get_user_input() -> Dict[str, str]:
    """Get subject and context from user interaction."""
    # Ask what they want to learn
    subject = input("\nQue souhaitez-vous apprendre ? ")
    
    # Generate context question
    print("\nGénération de la question de contexte...")
    
    # Ask for context
    print("\nDonne nous un peu plus de contexte pour pouvoir personnaliser ton parcours d'apprentissage\n" + context_chain.invoke({"subject": subject}).content)
    context = input("Votre réponse : ")
    
    return {
        "sujet": subject,
        "context": context
    }

def process_prompts(inputs: Dict[str, str]) -> Dict[str, str]:
    """Process the prompts with batch chapter content generation.
    
    Args:
        inputs: Dictionary containing subject and context
    
    Returns:
        Dictionary containing the learning plan and detailed chapter contents
    """
    print("\nGénération du plan d'apprentissage...")
    # First: Generate learning plan
    plan_result = plan_chain.invoke(inputs)
    learning_plan = json.loads(plan_result.content)
    
    print("\nGénération du contenu des chapitres...")
    # Second: Generate all chapter contents in a single batch
    chapters_result = chapters_chain.invoke({"learning_plan": plan_result.content})
    chapters_content = json.loads(chapters_result.content)
    
    # Update each chapter with its content
    for chapter in learning_plan["chapters"]:
        matching_content = next(
            (c for c in chapters_content["chapters"] if c["id"] == chapter["id"]),
            None
        )
        if matching_content:
            chapter["content"] = matching_content["content"]
    
    print("Génération du contenu terminée")
    
    return {
        "learning_plan": plan_result.content,
        "final_output": json.dumps(learning_plan, ensure_ascii=False, indent=2)
    }

def save_outputs(results: Dict[str, str]) -> None:
    """Save outputs to JSON files."""
    output_dir = Path(__file__).parent.parent.parent
    
    # Save the learning plan to a file
    learning_plan_path = output_dir / "learning_plan.json"
    with open(learning_plan_path, "w", encoding="utf-8") as f:
        json.dump(json.loads(results["final_output"]), f, ensure_ascii=False, indent=2)
    print(f"\nPlan d'apprentissage sauvegardé dans : {learning_plan_path}")

    # Save the final output to a file
    final_output_path = output_dir / "final_output.json"
    with open(final_output_path, "w", encoding="utf-8") as f:
        json.dump(json.loads(results["final_output"]), f, ensure_ascii=False, indent=2)
    print(f"Contenu détaillé sauvegardé dans : {final_output_path}")

def main():
    try:
        # Get user input
        inputs = get_user_input()
        
        # Process prompts
        results = process_prompts(inputs)
        
        # Display results
        print("\nPlan d'apprentissage :")
        print(results["learning_plan"])
        
        print("\nContenu détaillé :")
        print(results["final_output"])

        # Save outputs
        save_outputs(results)
        
    except Exception as e:
        print(f"Erreur : {str(e)}")

if __name__ == "__main__":
    main()
