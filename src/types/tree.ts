export interface Node {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "upcoming" | "locked";
  children: Node[];
  tags?: string[];
}

export interface TreeData {
  rootNode: Node;
  nodes: Node[];
}

export interface Message {
  id: string;
  sender: "ai" | "user";
  content: string;
  timestamp: string;
}

export interface Chapitre {
  id: string;
  title: string;
  prerequisites: string[];
  contenu: string | { [key: string]: string }; // Contenu peut être une chaîne ou un objet
}

export interface DataChapter {
  titre: string;
  description: string;
  id: string;
  chapitres: Chapitre[];
}