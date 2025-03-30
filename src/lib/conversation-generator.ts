import { Node, Message } from "@/types/tree";
import { getFromLocalStorage } from "@/utils/localStorage";
import { DataChapter, chapters } from "@/types/tree";

// Generate initial conversation messages based on the node
export const generateInitialMessages = (node: Node): Message[] => {
  const DataChapter = getFromLocalStorage("courseData", null);
  const chapterContent = DataChapter.chapters.find((chap: chapters) => chap.id === node.id)?.content ?? "null";
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
  if (chapterContent?.explanation) {
    messages.push({
      id: "explanation",
      sender: "ai",
      content: chapterContent.explanation,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    });
  }

  // Add tips message if available
  if (chapterContent?.tips) {
    messages.push({
      id: "tips",
      sender: "ai",
      content: `💡 Conseils :\n${chapterContent.tips}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    });
  }

  // Add resources message if available
  if (chapterContent?.resources?.length > 0) {
    const formattedResources = chapterContent.resources
    .map(resource => `- ${resource}`)
    .join('\n');

    messages.push({
      id: "resources",
      sender: "ai",
      content: `📚 Ressources :\n${formattedResources}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    });
  }

  return messages;
};

export const generateInitialEditMessage = (node: Node): Message => {
  const DataChapter = getFromLocalStorage("courseData", null);
  const chapterTitles = DataChapter?.chapters?.map((c)=> c.title) || [];
  console.log("Chapter Title:", chapterTitles);

  // Default welcome message based on node topic
  return {
      id: "1",
      sender: "ai",
      content: `Bienvenue dans le chapitre "${node.title}"! ${node.description}. Je vais vous aider tout au long de votre apprentissage. N'hésitez pas à poser des questions ou à demander des clarifications sur les sujets abordés.`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
  }
};

export const generateChapterMessages = (node: Node): Message[] => {
  // Récupération des données du cours depuis le localStorage
  const DataChapter = getFromLocalStorage("courseData", null);
  if (!DataChapter || !DataChapter.chapters) {
    console.error("Les données du cours ne sont pas disponibles.");
    return [];
  }

  // Recherche du chapitre correspondant à node.id
  const currentChapter = DataChapter.chapters.find(
    (chap: chapters) => chap.id === node.id
  );
  if (!currentChapter) {
    console.error(`Aucun chapitre trouvé pour l'id ${node.id}`);
    return [];
  }

  // Extraction du contenu du chapitre
  // Remarque : selon votre implémentation, la clé peut être "contenu" ou "content"
  const chapterContent = currentChapter.contenu ?? currentChapter.content ?? null;
  if (!chapterContent) {
    console.error(`Aucun contenu disponible pour le chapitre ${node.id}`);
    return [];
  }

  // Construction des messages individuels pour l'explication, le tip et les ressources
  const messages: Message[] = [
    {
      id: "msg-explanation",
      sender: "ai",
      content: `Explication : ${chapterContent.explanation}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    },
    {
      id: "msg-tip",
      sender: "ai",
      content: `Conseil : ${chapterContent.tips}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    },
    {
      id: "msg-resources",
      sender: "ai",
      // Jointure des ressources si elles sont sous forme de tableau
      content: `Ressources : ${Array.isArray(chapterContent.resources) ? chapterContent.resources.join(", ") : chapterContent.resources}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    }
  ];

  return messages;
};
