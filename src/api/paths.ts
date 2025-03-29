
import { TreeData } from "@/types/tree";

// Mock implementation using localStorage instead of Supabase
export type LearningPath = {
  id: string;
  goal: string;
  tree_data: TreeData;
  created_at: string;
  updated_at?: string;
};

// Helper function to get all paths from local storage
const getPathsFromStorage = (): LearningPath[] => {
  try {
    const paths = localStorage.getItem('learning_paths');
    return paths ? JSON.parse(paths) : [];
  } catch (e) {
    console.error('Error reading paths from localStorage:', e);
    return [];
  }
};

// Helper function to save paths to local storage
const savePathsToStorage = (paths: LearningPath[]): void => {
  try {
    localStorage.setItem('learning_paths', JSON.stringify(paths));
  } catch (e) {
    console.error('Error saving paths to localStorage:', e);
  }
};

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
