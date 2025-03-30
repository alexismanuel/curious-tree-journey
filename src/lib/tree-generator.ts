import { Node, TreeData } from "@/types/tree";

/**
 * Interface représentant la structure du nouveau format de cours
 */
interface NewCourseFormat {
  id: string;
  title: string;
  description: string;
  context: {
    niveau: string;
    objectif: string;
    délai: string;
    préférences: string;
    [key: string]: any; // Pour gérer d'autres clés potentielles
  };
  chapters: Chapter[];
}

/**
 * Interface représentant un chapitre dans le nouveau format
 */
interface Chapter {
  id: string;
  title: string;
  prerequisites: string[];
  [key: string]: any; // Pour gérer d'autres clés potentielles
}

/**
 * Génère une structure d'arbre hiérarchique à partir des données de cours au nouveau format
 * @param courseData - Les données de cours au nouveau format à transformer en arbre
 * @returns La structure d'arbre générée
 */
export const generateTreeFromCourseData = (courseData: NewCourseFormat): TreeData => {
  // Create root node
  const rootNode: Node = {
    id: courseData.id || "root",
    title: courseData.title || "Commencer ici",
    description: courseData.description || "",
    status: "active",
    children: []
  };
  
  // Create node map for easy access
  const nodeMap: Record<string, Node> = {
    [rootNode.id]: rootNode
  };
  
  // Create nodes for each chapter
  courseData.chapters.forEach((chapter) => {
    const chapterNode: Node = {
      id: chapter.id,
      title: chapter.title,
      description: chapter.content?.explanation || "",
      status: "locked",
      children: [],
      content: chapter.content,
      prerequisites: chapter.prerequisites || []
    };
    
    nodeMap[chapter.id] = chapterNode;
  });
  
  // Build parent-child relationships
  courseData.chapters.forEach((chapter) => {
    const chapterNode = nodeMap[chapter.id];
    const prerequisites = chapter.prerequisites || [];
    
    if (prerequisites.length === 0) {
      // No prerequisites, attach to root
      rootNode.children.push(chapterNode);
      // First chapter without prerequisites will be upcoming
      if (chapterNode.status === "locked" && rootNode.children.length === 1) {
        chapterNode.status = "upcoming";
      }
    } else {
      // Find the last prerequisite that exists in our node map
      const lastPrereq = prerequisites
        .slice()
        .reverse()
        .find(prereqId => nodeMap[prereqId]);
      
      if (lastPrereq && nodeMap[lastPrereq]) {
        nodeMap[lastPrereq].children.push(chapterNode);
      } else {
        // If no valid prerequisite found, attach to root
        console.warn(`No valid prerequisites found for chapter ${chapter.id}, attaching to root`);
        rootNode.children.push(chapterNode);
      }
    }
  });
  
  return {
    rootNode,
    nodes: Object.values(nodeMap)
  };
};

/**
 * Fonction utilitaire pour convertir les données JSON brutes en objet NewCourseFormat
 * @param jsonData - Les données JSON à convertir
 * @returns Les données de cours converties
 */
export const parseCourseData = (jsonData: string): NewCourseFormat => {
  try {
    return JSON.parse(jsonData) as NewCourseFormat;
  } catch (error) {
    console.error("Erreur lors de l'analyse des données de cours:", error);
    // Retourner une structure vide en cas d'erreur
    return {
      id: "",
      title: "",
      description: "",
      context: {
        niveau: "",
        objectif: "",
        délai: "",
        préférences: ""
      },
      chapters: []
    };
  }
};