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
    [key: string]: any;
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
  [key: string]: any;
}

/**
 * Génère une structure d'arbre hiérarchique à partir des données de cours
 * sans inclure le node « Commencer ici » si possible.
 * - Si un seul chapitre de premier niveau existe, il devient la racine.
 * - Sinon, on crée une racine virtuelle avec un titre vide.
 * @param courseData - Les données de cours au nouveau format
 * @returns La structure d'arbre générée
 */
export const generateTreeFromCourseData = (courseData: NewCourseFormat): TreeData => {
  // Création de tous les nodes correspondant aux chapitres
  const nodeMap: Record<string, Node> = {};
  courseData.chapters.forEach(chapter => {
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

  // Récupérer les nodes de premier niveau (sans prérequis ou avec prérequis invalides)
  const topLevelNodes: Node[] = [];
  courseData.chapters.forEach(chapter => {
    const currentNode = nodeMap[chapter.id];
    if (chapter.prerequisites && chapter.prerequisites.length > 0) {
      // On prend le dernier prérequis valide, le cas échéant
      const lastPrereqId = [...chapter.prerequisites].reverse().find(prereqId => nodeMap[prereqId]);
      if (lastPrereqId && nodeMap[lastPrereqId]) {
        nodeMap[lastPrereqId].children.push(currentNode);
      } else {
        topLevelNodes.push(currentNode);
      }
    } else {
      topLevelNodes.push(currentNode);
    }
  });

  // Définir le statut "upcoming" sur le premier node de premier niveau, s'il est "locked"
  if (topLevelNodes.length > 0 && topLevelNodes[0].status === "locked") {
    topLevelNodes[0].status = "upcoming";
  }

  // Si un seul node de premier niveau, il devient la racine, sinon on crée une racine virtuelle
  let rootNode: Node;
  if (topLevelNodes.length === 1) {
    rootNode = topLevelNodes[0];
  } else {
    rootNode = {
      id: "virtual-root",
      title: "", // Titre vide pour ne rien afficher
      description: "",
      status: "active",
      children: topLevelNodes
    };
  }

  // Fonction récursive pour rassembler tous les nodes de l'arbre
  const gatherNodes = (node: Node): Node[] => {
    return [node, ...node.children.flatMap(child => gatherNodes(child))];
  };
  const allNodes = gatherNodes(rootNode);

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
