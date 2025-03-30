
import { useState, useEffect } from "react";
import { create } from "zustand";

// Types
export type NodeStatus = "completed" | "active" | "upcoming" | "locked";

export interface Node {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  children: Node[];
}

export interface TreeData {
  rootNode: Node;
  nodes: Node[];
}

export type LearningPath = {
  id: string;
  goal: string;
  tree_data: TreeData;
  created_at: string;
  updated_at?: string;
};

export type Message = {
  id: string;
  sender: "ai" | "user";
  content: string;
  timestamp: string;
};

// LocalStorage helpers
const getPathsFromStorage = (): LearningPath[] => {
  try {
    const paths = localStorage.getItem('learning_paths');
    return paths ? JSON.parse(paths) : [];
  } catch (e) {
    console.error('Error reading paths from localStorage:', e);
    return [];
  }
};

const savePathsToStorage = (paths: LearningPath[]): void => {
  try {
    localStorage.setItem('learning_paths', JSON.stringify(paths));
  } catch (e) {
    console.error('Error saving paths to localStorage:', e);
  }
};

const getConversationsFromStorage = (): { path_id: string; node_id: string; messages: Message[] }[] => {
  try {
    const conversations = localStorage.getItem('conversations');
    return conversations ? JSON.parse(conversations) : [];
  } catch (e) {
    console.error('Error reading conversations from localStorage:', e);
    return [];
  }
};

const saveConversationsToStorage = (conversations: { path_id: string; node_id: string; messages: Message[] }[]): void => {
  try {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  } catch (e) {
    console.error('Error saving conversations to localStorage:', e);
  }
};

// Learning Path API
export const createPath = async (goal: string, treeData: TreeData): Promise<string> => {
  try {
    const paths = getPathsFromStorage();
    const newPath: LearningPath = {
      id: `path_${Date.now()}`,
      goal,
      tree_data: treeData,
      created_at: new Date().toISOString()
    };
    
    paths.push(newPath);
    savePathsToStorage(paths);
    
    return newPath.id;
  } catch (error) {
    console.error('Error creating path:', error);
    throw new Error('Failed to create learning path');
  }
};

export const fetchPath = async (pathId: string): Promise<LearningPath> => {
  try {
    const paths = getPathsFromStorage();
    const path = paths.find(p => p.id === pathId);
    
    if (!path) {
      throw new Error('Path not found');
    }
    
    return path;
  } catch (error) {
    console.error('Error fetching path:', error);
    throw new Error('Failed to fetch learning path');
  }
};

export const fetchUserPaths = async (): Promise<LearningPath[]> => {
  try {
    return getPathsFromStorage();
  } catch (error) {
    console.error('Error fetching user paths:', error);
    throw new Error('Failed to fetch user learning paths');
  }
};

export const updatePath = async (pathId: string, treeData: TreeData): Promise<void> => {
  try {
    const paths = getPathsFromStorage();
    const pathIndex = paths.findIndex(p => p.id === pathId);
    
    if (pathIndex === -1) {
      throw new Error('Path not found');
    }
    
    paths[pathIndex] = {
      ...paths[pathIndex],
      tree_data: treeData,
      updated_at: new Date().toISOString()
    };
    
    savePathsToStorage(paths);
  } catch (error) {
    console.error('Error updating path:', error);
    throw new Error('Failed to update learning path');
  }
};

export const deletePath = async (pathId: string): Promise<void> => {
  try {
    const paths = getPathsFromStorage();
    const updatedPaths = paths.filter(p => p.id !== pathId);
    
    savePathsToStorage(updatedPaths);
  } catch (error) {
    console.error('Error deleting path:', error);
    throw new Error('Failed to delete learning path');
  }
};

// Conversation API
export const fetchConversation = async (pathId: string, nodeId: string): Promise<Message[]> => {
  try {
    const conversations = getConversationsFromStorage();
    const conversation = conversations.find(c => c.path_id === pathId && c.node_id === nodeId);
    
    return conversation?.messages || [];
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to fetch conversation');
  }
};

export const saveMessage = async (
  pathId: string, 
  nodeId: string, 
  message: Omit<Message, 'id'>
): Promise<Message> => {
  try {
    const conversations = getConversationsFromStorage();
    const conversationIndex = conversations.findIndex(c => c.path_id === pathId && c.node_id === nodeId);
    
    const newMessage = {
      ...message,
      id: Date.now().toString(),
    };
    
    if (conversationIndex === -1) {
      // No conversation found, create a new one
      conversations.push({
        path_id: pathId,
        node_id: nodeId,
        messages: [newMessage],
      });
    } else {
      // Update existing conversation
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        messages: [...conversations[conversationIndex].messages, newMessage],
      };
    }
    
    saveConversationsToStorage(conversations);
    return newMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
};

export const generateAIResponse = async (
  pathId: string,
  nodeId: string,
  userMessage: string
): Promise<Message> => {
  // Simple templated response
  const aiMessage: Omit<Message, 'id'> = {
    sender: 'ai',
    content: `I understand your question about "${userMessage.substring(0, 30)}...". Let me explain more about this concept.`,
    timestamp: new Date().toISOString(),
  };
  
  return saveMessage(pathId, nodeId, aiMessage);
};

// Tree Store
interface TreeState {
  learningGoal: string;
  currentPath: string | null;
  activeNode: Node | null;
  treeData: TreeData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLearningGoal: (goal: string) => void;
  setActiveNode: (node: Node) => void;
  completeNode: (nodeId: string) => void;
  fetchPath: (pathId: string) => Promise<void>;
  createPath: (goal: string) => Promise<string>;
  savePath: () => Promise<void>;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  learningGoal: "",
  currentPath: null,
  activeNode: null,
  treeData: null,
  isLoading: false,
  error: null,

  setLearningGoal: (goal) => set({ learningGoal: goal }),
  
  setActiveNode: (node) => {
    const { treeData } = get();
    
    if (node.status === "locked") {
      return;
    }
    
    set({ activeNode: node });
    
    if (node.status === "upcoming") {
      // Update node status to active
      set((state) => {
        if (!state.treeData) return state;
        
        const updateNodeStatus = (nodes: Node[]): Node[] => {
          return nodes.map(n => {
            if (n.id === node.id) {
              return { ...n, status: "active" as NodeStatus };
            }
            
            if (n.children) {
              return { ...n, children: updateNodeStatus(n.children) };
            }
            
            return n;
          });
        };
        
        return {
          ...state,
          treeData: {
            ...state.treeData,
            nodes: updateNodeStatus(state.treeData.nodes),
            rootNode: state.treeData.rootNode.id === node.id 
              ? { ...state.treeData.rootNode, status: "active" as NodeStatus } 
              : { ...state.treeData.rootNode, children: updateNodeStatus(state.treeData.rootNode.children) }
          }
        };
      });
    }
  },
  
  completeNode: (nodeId) => {
    set((state) => {
      if (!state.treeData) return state;
      
      const unlockDownstreamNodes = (node: Node): Node => {
        if (node.id === nodeId) {
          // Mark the completed node
          node = { ...node, status: "completed" as NodeStatus };
        }

        if (node.children && node.children.length > 0) {
          // If this is the completed node or one of its ancestors,
          // unlock all children and process them recursively
          const isCompletedNodeOrAncestor = node.id === nodeId || 
            node.children.some(child => child.id === nodeId);

          return {
            ...node,
            children: node.children.map(child => ({
              ...child,
              status: isCompletedNodeOrAncestor && child.status === "locked" ? 
                ("upcoming" as NodeStatus) : child.status,
              children: unlockDownstreamNodes(child).children
            }))
          };
        }

        return node;
      };

      const updateNodeStatus = (nodes: Node[]): Node[] => {
        return nodes.map(node => unlockDownstreamNodes({ ...node }));
      };
      
      const updatedRootNode = state.treeData.rootNode.id === nodeId 
        ? { ...state.treeData.rootNode, status: "completed" as NodeStatus } 
        : { ...state.treeData.rootNode, children: updateNodeStatus(state.treeData.rootNode.children) };
      
      return {
        ...state,
        treeData: {
          ...state.treeData,
          nodes: updateNodeStatus(state.treeData.nodes),
          rootNode: updatedRootNode
        }
      };
    });
  },
  
  fetchPath: async (pathId) => {
    set({ isLoading: true, error: null });
    
    try {
      const pathData = await fetchPath(pathId);
      
      if (pathData) {
        set({
          currentPath: pathId,
          learningGoal: pathData.goal,
          treeData: pathData.tree_data,
          activeNode: pathData.tree_data.rootNode,
        });
      }
    } catch (error) {
      console.error('Error fetching path:', error);
      set({ error: 'Failed to load learning path' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createPath: async (goal) => {
    set({ isLoading: true, error: null, learningGoal: goal });
    
    try {
      // This will be replaced with real tree generation logic
      const { generateInitialTree } = await import('@/lib/tree-generator');
      const treeData = generateInitialTree(goal);
      
      // Save to localStorage through our mock implementation
      const pathId = await createPath(goal, treeData);
      
      set({
        currentPath: pathId,
        treeData,
        activeNode: treeData.rootNode
      });
      
      return pathId;
    } catch (error) {
      console.error('Error creating path:', error);
      set({ error: 'Failed to create learning path' });
      return '';
    } finally {
      set({ isLoading: false });
    }
  },
  
  savePath: async () => {
    const { currentPath, treeData } = get();
    if (!currentPath || !treeData) return;
    
    set({ isLoading: true, error: null });
    
    try {
      await updatePath(currentPath, treeData);
    } catch (error) {
      console.error('Error saving path:', error);
      set({ error: 'Failed to save learning path' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Custom hooks
export const useConversation = (pathId: string | null, nodeId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    if (!pathId || !nodeId) return;
    
    try {
      setIsLoading(true);
      const conversationMessages = await fetchConversation(pathId, nodeId);
      
      if (conversationMessages.length === 0) {
        // If no conversation exists, we'll handle this in the component
        setMessages([]);
      } else {
        setMessages(conversationMessages);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [pathId, nodeId]);

  const sendMessage = async (content: string) => {
    if (!pathId || !nodeId) return null;
    
    try {
      // Add user message
      const userMessage: Omit<Message, 'id'> = {
        sender: "user",
        content,
        timestamp: new Date().toISOString()
      };
      
      const savedUserMessage = await saveMessage(pathId, nodeId, userMessage);
      setMessages(prev => [...prev, savedUserMessage]);
      
      // Generate AI response
      const aiMessage = await generateAIResponse(pathId, nodeId, content);
      setMessages(prev => [...prev, aiMessage]);
      
      return aiMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages
  };
};
