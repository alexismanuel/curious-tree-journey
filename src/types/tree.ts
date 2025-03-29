export interface Node {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "upcoming" | "locked";
  children: Node[];
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
