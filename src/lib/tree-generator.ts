import { Node, TreeData } from "@/types/tree";

/**
 * Interface représentant la structure des données de cours
 */
interface CourseData {
  titre: string;
  description: string;
  niveau: string;
  chapitres: Chapitre[];
}

/**
 * Interface représentant la structure d'un chapitre
 */
interface Chapitre {
  Titre: string;
  Contenu: {
    Introduction: string;
    "Objectifs d'apprentissage": string[];
    "Contenu principal": string[];
    "Activités et exercices"?: string[];
    "Ressources supplémentaires"?: string[];
    "Evaluation"?: string[];
    "Évaluation"?: string[];
    Conclusion: string;
    [key: string]: any; // Pour gérer d'autres clés potentielles
  };
}

/**
 * Génère une structure d'arbre linéaire à partir des données de cours fournies
 * @param courseData - Les données de cours à transformer en arbre
 * @param goal - L'objectif d'apprentissage (utilisé si le titre du cours est vide)
 * @returns La structure d'arbre générée
 */
export const generateTreeFromCourseData = (courseData: CourseData, goal?: string): TreeData => {
  // Utiliser le titre du cours s'il existe, sinon utiliser un titre par défaut
  const courseTitle = courseData.titre.trim() || (goal && typeof goal === 'string' 
    ? `Introduction to ${goal.split(" ").slice(-1)[0]}`
    : "Introduction au cours");
  
  // Créer le nœud racine
  const rootNode: Node = {
    id: "root",
    title: "Commencer ici",
    description: courseData.description,
    status: "active",
    children: []
  };
  
  // Ajouter les chapitres comme enfants directs du nœud racine dans un ordre linéaire
  courseData.chapitres.forEach((chapitre, index) => {
    // Utiliser directement le titre du chapitre ou générer un titre par défaut
    const chapitreTitle = chapitre.Titre.trim() || `Chapitre ${index + 1}`;
    
    // Déterminer le statut du chapitre en fonction de sa position
    const status = index === 0 ? "upcoming" : "locked";
    
    // Créer le nœud du chapitre avec un titre dynamique
    const chapitreNode: Node = {
      id: `chapitre-${index + 1}`,
      title: chapitreTitle,
      description: "", // Pas de description pour se concentrer uniquement sur le titre
      status: status,
      children: [],
      // Ajouter des métadonnées supplémentaires pour enrichir le nœud
    };
    
    // Ajouter le chapitre comme enfant du nœud racine
    rootNode.children.push(chapitreNode);
  });
  
  // Créer la liste complète de tous les nœuds
  const allNodes = [
    rootNode,
    ...rootNode.children
  ];
  
  return {
    rootNode,
    nodes: allNodes
  };
};

/**
 * Génère un arbre initial basé sur l'objectif d'apprentissage
 * Fonction maintenue pour compatibilité avec le code existant
 * @param goal - L'objectif d'apprentissage
 * @returns Un arbre par défaut si aucune donnée de cours n'est disponible
 */
export const generateInitialTree = (goal?: string): TreeData => {
  // S'assurer que goal est une chaîne de caractères
  const goalString = goal && typeof goal === 'string' ? goal : "Course";
  // Cette fonction est maintenue pour compatibilité
  // Dans un cas réel, elle pourrait appeler generateTreeFromCourseData avec des données par défaut
  
  const rootNode: Node = {
    id: "root",
    title: "Introduction to " + goalString.split(" ").slice(-1)[0],
    description: "Core concepts and foundations",
    status: "active",
    children: [
      {
        id: "chapitre-1",
        title: "Chapitre 1",
        description: "Introduction au premier chapitre",
        status: "upcoming",
        children: []
      },
      {
        id: "chapitre-2",
        title: "Chapitre 2",
        description: "Introduction au deuxième chapitre",
        status: "locked",
        children: []
      },
      {
        id: "chapitre-3",
        title: "Chapitre 3",
        description: "Introduction au troisième chapitre",
        status: "locked",
        children: []
      }
    ]
  };
  
  return {
    rootNode,
    nodes: [
      rootNode,
      ...rootNode.children
    ]
  };
};

/**
 * Fonction utilitaire pour convertir les données JSON brutes en objet CourseData
 * @param jsonData - Les données JSON à convertir
 * @returns Les données de cours converties
 */
export const parseCourseData = (jsonData: string): CourseData => {
  try {
    return JSON.parse(jsonData) as CourseData;
  } catch (error) {
    console.error("Erreur lors de l'analyse des données de cours:", error);
    // Retourner une structure vide en cas d'erreur
    return {
      titre: "",
      description: "",
      niveau: "",
      chapitres: []
    };
  }
};