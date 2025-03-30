import { Node, Message } from "@/types/tree";
import { getFromLocalStorage } from "@/utils/localStorage";
import { DataChapter, Chapitre } from "@/types/tree";

// Generate initial conversation messages based on the node
export const generateInitialMessages = (node: Node): Message[] => {
  const DataChapter = getFromLocalStorage("courseData", null);
  const chapterContent = DataChapter.chapitres.find((chap: Chapitre) => chap.id === node.id)?.contenu;
  console.log("Chapter Content:", chapterContent);

  // If the node is already completed, return a summary conversation
  if (node.status === "completed") {
    return [
      {
        id: "1",
        sender: "ai",
        content: `Vous avez déjà maitriser "${node.title}". Voulez-vous revoir des points ?`,
        timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
      }
    ];
  }

  // Default welcome message based on node topic
  return [
    {
      id: "1",
      sender: "ai",
      content: `Bienvenue dans le chapitre "${node.title}"! ${node.description}. Je vais vous aider tout au long de votre apprentissage. N'hésitez pas à poser des questions ou à demander des clarifications sur les sujets abordés. Voici les premiéres ressources pour commencer votre apprentissage : `,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    },
    {
      id: "2",
      sender: "ai",
      content: `Voici le contenu du chapitre : ${chapterContent}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    }
  ];
};

export const generateInitialEditMessage = (): Message => {
  const DataChapter = getFromLocalStorage("courseData", null);
  const chapterTitles = DataChapter.chapitres.map((c)=> c.title);
  console.log("Chapter Title:", chapterTitles);

  // Default welcome message based on node topic
  return {
      id: "1",
      sender: "ai",
      content: `Bienvenue dans le chapitre "${node.title}"! ${node.description}. Je vais vous aider tout au long de votre apprentissage. N'hésitez pas à poser des questions ou à demander des clarifications sur les sujets abordés. Voici les premiéres ressources pour commencer votre apprentissage : `,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
  }
};
