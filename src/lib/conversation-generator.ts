import { Node, Message } from "@/types/tree";
import { getFromLocalStorage } from "@/utils/localStorage";
import { DataChapter, Chapitre } from "@/types/tree";

// Generate initial conversation messages based on the node
export const generateInitialMessages = (node: Node): Message[] => {
  const DataChapter = getFromLocalStorage("courseData", null);
  const chapterContent = DataChapter.chapters.find((chap: Chapitre) => chap.id === node.id)?.contenu ?? "null";
  console.log("Chapter Content:", chapterContent);

  // If the node is already completed, return a summary conversation
  if (node.status === "completed") {
    return [
      {
        id: "1",
        sender: "ai",
        content: `Vous avez déjà maîtrisé "${node.title}". Voulez-vous revoir des points ?`,
        timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
      }
    ];
  }

  // Initialize messages with content attributes
  const messages: Message[] = [];
  
  // Add explanation message if available
  if (node.content?.explanation) {
    messages.push({
      id: "explanation",
      sender: "ai",
      content: node.content.explanation,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    });
  }

  // Add tips message if available
  if (node.content?.tips) {
    messages.push({
      id: "tips",
      sender: "ai",
      content: `💡 Conseils :\n${node.content.tips}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    });
  }

  // Add resources message if available
  if (node.content?.resources?.length > 0) {
    messages.push({
      id: "resources",
      sender: "ai",
      content: `📚 Ressources :\n${node.content.resources.join('\n')}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    });
  }

  return messages;
};

export const generateInitialEditMessage = (node: Node): Message => {
  const DataChapter = getFromLocalStorage("courseData", null);
  const chapterTitles = DataChapter?.chapitres?.map((c)=> c.title) || [];
  console.log("Chapter Title:", chapterTitles);

  // Default welcome message based on node topic
  return {
      id: "1",
      sender: "ai",
      content: `Bienvenue dans le chapitre "${node.title}"! ${node.description}. Je vais vous aider tout au long de votre apprentissage. N'hésitez pas à poser des questions ou à demander des clarifications sur les sujets abordés.`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
  }
};