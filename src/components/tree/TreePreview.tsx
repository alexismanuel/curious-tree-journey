import { useState } from "react";
import { ConversationPanel } from "./ConversationPanel";
import { Button } from "../ui/button";
import { Message, TreeData } from "@/types/tree";

interface TreePreviewProps {
  courseData: TreeData;
  onConfirm: () => void;
  onEdit: () => void;
}

export function TreePreview({ courseData, onConfirm, onEdit }: TreePreviewProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Create initial message with course structure
    const courseStructure = formatCourseStructure(courseData);
    return [
      {
        id: "initial",
        sender: "ai",
        content: courseStructure,
        timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
      }
    ];
  });

  // Format course data into readable text
  function formatCourseStructure(data: TreeData): string {
    const rootNode = data.rootNode;
    const nodes = data.nodes;
    
    let text = `Voici le plan de votre formation "${rootNode.title}" :\n\n`;
    
    // Sort nodes by their position in the tree (breadth-first traversal)
    const sortedNodes = nodes.filter(node => node.id !== rootNode.id);
    
    sortedNodes.forEach((node, index) => {
      // Add chapter number and title
      text += `Chapitre ${index + 1} : ${node.title}\n`;
      
      // Add chapter description if available
      if (node.description) {
        text += `${node.description}\n`;
      }
      
      text += "\n";
    });
    
    text += "\nVous pouvez modifier ce plan ou commencer votre apprentissage directement.";
    
    return text;
  }

  const mockNode = {
    id: "preview",
    title: "Aperçu de votre formation",
    description: "",
    status: "active" as const,
    children: []
  };

  return (
    <div className="h-full flex flex-col">
      <ConversationPanel
        node={mockNode}
        messages={messages}
        onComplete={onConfirm}
        onBack={onEdit}
        disabled={true}
      />
    </div>
  );
}
