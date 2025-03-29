
export type NodeStatus = "completed" | "active" | "upcoming" | "locked";

export interface Node {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  children: Node[];
  niveau: string;
}

export interface TreeData {
  rootNode: Node;
  nodes: Node[];
}
