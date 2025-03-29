
import { create } from "zustand";
import { TreeData, Node, NodeStatus } from "@/types/tree";
import { createPath, fetchPath, updatePath } from "@/api/paths";

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
      
      const updateNodeStatus = (nodes: Node[]): Node[] => {
        return nodes.map(n => {
          if (n.id === nodeId) {
            return { ...n, status: "completed" as NodeStatus };
          }
          
          if (n.id === nodeId && n.children) {
            return {
              ...n,
              status: "completed" as NodeStatus,
              children: n.children.map(child => ({
                ...child,
                status: child.status === "locked" ? ("upcoming" as NodeStatus) : child.status
              }))
            };
          }
          
          if (n.children) {
            return { ...n, children: updateNodeStatus(n.children) };
          }
          
          return n;
        });
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
      // For now, we'll use the demo generator
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
