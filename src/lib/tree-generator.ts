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
  // Créer le nœud racine
  const rootNode: Node = {
    id: "root",
    title: "Commencer ici",
    description: courseData.description,
    status: "active",
    children: []
  };
  
  // Créer un dictionnaire pour accéder facilement aux nœuds par ID
  const nodeMap: Record<string, Node> = {
    "root": rootNode
  };
  
  // Créer les nœuds pour chaque chapitre
  courseData.chapters.forEach((chapter) => {
    const chapterNode: Node = {
      id: chapter.id,
      title: chapter.title,
      description: "", // Pas de description détaillée dans le nouveau format
      status: "locked", // Par défaut tous les chapitres sont verrouillés
      children: []
    };
    
    // Ajouter le nœud au dictionnaire
    nodeMap[chapter.id] = chapterNode;
  });
  
  // Établir les relations parent-enfant en fonction des prérequis
  courseData.chapters.forEach((chapter) => {
    const chapterNode = nodeMap[chapter.id];
    
    if (chapter.prerequisites.length === 0) {
      // Chapitre sans prérequis, donc directement rattaché à la racine
      rootNode.children.push(chapterNode);
      // Le premier chapitre sans prérequis sera en "upcoming"
      if (chapterNode.status === "locked" && rootNode.children.length === 1) {
        chapterNode.status = "upcoming";
      }
    } else {
      // Chapitre avec prérequis, on l'attache au dernier prérequis
      const lastPrereqId = chapter.prerequisites[chapter.prerequisites.length - 1];
      const parentNode = nodeMap[lastPrereqId];
      if (parentNode) {
        parentNode.children.push(chapterNode);
      } else {
        console.warn(`Parent node with ID ${lastPrereqId} not found for chapter ${chapter.id}`);
        // Fallback: attacher à la racine
        rootNode.children.push(chapterNode);
      }
    }
  });
  
  // Créer la liste complète de tous les nœuds
  const allNodes = Object.values(nodeMap);
  
  return {
    rootNode,
    nodes: allNodes
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