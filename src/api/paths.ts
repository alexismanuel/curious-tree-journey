
import { supabase } from "@/integrations/supabase/client";
import { TreeData } from "@/types/tree";

export type LearningPath = {
  id: string;
  goal: string;
  tree_data: TreeData;
  created_at: string;
  updated_at?: string;
  user_id?: string;
};

export const createPath = async (goal: string, treeData: TreeData): Promise<string> => {
  const { data, error } = await supabase
    .from('learning_paths')
    .insert([{ 
      goal, 
      tree_data: treeData,
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();
    
  if (error) {
    console.error('Error creating path:', error);
    throw new Error('Failed to create learning path');
  }
  
  return data.id;
};

export const fetchPath = async (pathId: string): Promise<LearningPath> => {
  const { data, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('id', pathId)
    .single();
    
  if (error) {
    console.error('Error fetching path:', error);
    throw new Error('Failed to fetch learning path');
  }
  
  return data;
};

export const fetchUserPaths = async (): Promise<LearningPath[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching user paths:', error);
    throw new Error('Failed to fetch user learning paths');
  }
  
  return data || [];
};

export const updatePath = async (pathId: string, treeData: TreeData): Promise<void> => {
  const { error } = await supabase
    .from('learning_paths')
    .update({ 
      tree_data: treeData,
      updated_at: new Date().toISOString()
    })
    .eq('id', pathId);
    
  if (error) {
    console.error('Error updating path:', error);
    throw new Error('Failed to update learning path');
  }
};

export const deletePath = async (pathId: string): Promise<void> => {
  const { error } = await supabase
    .from('learning_paths')
    .delete()
    .eq('id', pathId);
    
  if (error) {
    console.error('Error deleting path:', error);
    throw new Error('Failed to delete learning path');
  }
};
