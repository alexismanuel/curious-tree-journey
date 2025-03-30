export interface ChapterContent {
  explanation?: string;
  tips?: string;
  resources?: string[];
}

export interface Node {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "upcoming" | "locked";
  children: Node[];
  tags?: string[];
  content?: ChapterContent;
  prerequisites?: string[];
}

export interface CoursePlan {
  title: string;
  description: string;
  chapters: Array<{
    id: string;
    title: string;
    prerequisites: string[];
  }>;
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
  isInitial?: boolean;
}

export interface chapters {
  id: string;
  title: string;
  prerequisites: string[];
  contenu: string | { [key: string]: string }; // Contenu peut être une chaîne ou un objet
}

export interface DataChapter {
  title: string;
  description: string;
  id: string;
  chapters: chapters[];
}