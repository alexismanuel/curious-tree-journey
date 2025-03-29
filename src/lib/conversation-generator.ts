
import { Node } from "@/types/tree";

interface Message {
  id: string;
  sender: "ai" | "user";
  content: string;
  timestamp: Date;
}

// Generate initial conversation messages based on the node
export const generateInitialMessages = (node: Node): Message[] => {
  const now = new Date();
  
  // If the node is already completed, return a summary conversation
  if (node.status === "completed") {
    return [
      {
        id: "1",
        sender: "ai",
        content: `You've already mastered "${node.title}". Would you like to review this topic again or continue to the next one?`,
        timestamp: now
      }
    ];
  }
  
  // Default welcome message based on node topic
  return [
    {
      id: "1",
      sender: "ai",
      content: `Welcome to "${node.title}"! ${node.description}. What would you like to learn about this topic?`,
      timestamp: now
    }
  ];
};
