
import { Node, TreeData } from "@/types/tree";

// Generate a sample tree structure based on the learning goal
export const generateInitialTree = (goal: string): TreeData => {
  // This is a simplified version - in a real app, this would be generated
  // by an AI model based on the learning goal
  
  const rootNode: Node = {
    id: "root",
    title: "Introduction to " + goal.split(" ").slice(-1)[0],
    description: "Core concepts and foundations",
    status: "active",
    children: [
      {
        id: "fundamentals",
        title: "Fundamental Concepts",
        description: "Basic principles and terminology",
        status: "upcoming",
        children: [
          {
            id: "concept1",
            title: "Key Principle 1",
            description: "Understanding the first core principle",
            status: "locked",
            children: []
          },
          {
            id: "concept2",
            title: "Key Principle 2",
            description: "Understanding the second core principle",
            status: "locked",
            children: []
          },
        ]
      },
      {
        id: "intermediate",
        title: "Intermediate Topics",
        description: "Building on the fundamentals",
        status: "locked",
        children: [
          {
            id: "topic1",
            title: "Advanced Concept 1",
            description: "Exploring more complex ideas",
            status: "locked",
            children: []
          },
          {
            id: "topic2",
            title: "Advanced Concept 2",
            description: "Deeper understanding and applications",
            status: "locked",
            children: []
          },
        ]
      },
      {
        id: "advanced",
        title: "Advanced Applications",
        description: "Practical usage and implementation",
        status: "locked",
        children: []
      }
    ]
  };
  
  return {
    rootNode,
    nodes: [
      rootNode,
      ...rootNode.children,
      ...rootNode.children.flatMap(node => node.children || [])
    ]
  };
};
