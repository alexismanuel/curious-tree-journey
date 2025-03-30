import os
import json
from pathlib import Path
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_mistralai.chat_models import ChatMistralAI
from typing import Dict, List, Optional, Tuple

# Check for Mistral API key
MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("""
Erreur : La clé API Mistral n'est pas configurée.

Veuillez configurer la variable d'environnement MISTRAL_API_KEY :

    export MISTRAL_API_KEY=votre_clé_api

Vous pouvez obtenir une clé API sur : https://console.mistral.ai/
""")

# Initialize the Mistral LLM
llm = ChatMistralAI(
    mistral_api_key=MISTRAL_API_KEY,
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
feedback_prompt_path = prompts_dir / 'prompt_feedback.txt'

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

def pretty_print_plan(plan: dict) -> None:
    """Print the learning plan in a readable format."""
    print("\n=== Plan d'apprentissage ===\n")
    print(f"Titre: {plan['title']}")
    print(f"Description: {plan['description']}\n")
    print("Chapitres:")
    for chapter in plan['chapters']:
        print(f"\n{chapter['id']}. {chapter['title']}")
        if chapter.get('prerequisites'):
            print(f"   Prérequis: {', '.join(chapter['prerequisites'])}")

def process_feedback(context: str, current_plan: dict, user_message: str, conversation: List[str]) -> tuple[str, Optional[dict]]:
    """Process user feedback about the learning plan.
    
    Args:
        context: Original learning context
        current_plan: Current learning plan
        user_message: User's feedback or question
        conversation: List of previous messages
    
    Returns:
        Tuple of (response message, updated plan or None)
    """
    # Convert conversation history to string format
    conversation_history = "\n".join(conversation)
    
    # Get feedback from LLM
    result = feedback_chain.invoke({
        "context": context,
        "current_plan": json.dumps(current_plan, ensure_ascii=False),
        "user_message": user_message,
        "conversation_history": conversation_history
    })
    
    # Parse the response
    try:
        feedback = json.loads(result.content)
        response = feedback["response"]
        new_plan = feedback["plan"]
        if isinstance(new_plan, str):
            new_plan = json.loads(new_plan)
        return response, new_plan
    except json.JSONDecodeError as e:
        print(f"\nErreur de format dans la réponse : {str(e)}")
        print("\nRéponse reçue :")
        print(result.content)
        return "Désolé, je n'ai pas pu traiter cette réponse. Pouvez-vous reformuler votre demande ?", None

def main():
    try:
        # Get user input
        inputs = get_user_input()
        user_context = inputs["context"]  # Store context for feedback loop
        
        # Generate initial plan
        print("\nGénération du plan d'apprentissage...")
        plan_result = plan_chain.invoke(inputs)
        current_plan = json.loads(plan_result.content)
        pretty_print_plan(current_plan)
        
        # Start feedback loop
        conversation = []
        while True:
            print("\nQue pensez-vous de ce plan ? (V pour valider, ou donnez vos commentaires)")
            user_input = input("> ")
            
            if user_input.lower() == 'v':
                break
            
            # Process feedback
            response, new_plan = process_feedback(user_context, current_plan, user_input, conversation)
            conversation.extend([f"User: {user_input}", f"Assistant: {response}"])
            
            # Update plan if changed
            if new_plan:
                current_plan = new_plan
                pretty_print_plan(current_plan)
            else:
                print(f"\n{response}")
        
        # Generate detailed chapter contents
        print("\nGénération du contenu détaillé des chapitres...")
        chapters_result = chapters_chain.invoke({"learning_plan": json.dumps(current_plan)})
        chapters_content = json.loads(chapters_result.content)
        
        # Update each chapter with its content
        for chapter in current_plan["chapters"]:
            matching_content = next(
                (c for c in chapters_content["chapters"] if c["id"] == chapter["id"]),
                None
            )
            if matching_content:
                chapter["content"] = matching_content["content"]
        
        # Save final plan
        save_outputs({
            "learning_plan": json.dumps(current_plan),
            "final_output": json.dumps(current_plan, ensure_ascii=False, indent=2)
        })
        
    except Exception as e:
        print(f"\nErreur : {str(e)}")

if __name__ == "__main__":
    main()
