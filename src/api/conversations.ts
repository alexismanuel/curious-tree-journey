
import { supabase } from "@/integrations/supabase/client";

export type Message = {
  id: string;
  sender: "ai" | "user";
  content: string;
  timestamp: string;
};

export const fetchConversation = async (pathId: string, nodeId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('messages')
    .eq('path_id', pathId)
    .eq('node_id', nodeId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No conversation found for this node, return empty array
      return [];
    }
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to fetch conversation');
  }
  
  return data?.messages || [];
};

export const saveMessage = async (
  pathId: string, 
  nodeId: string, 
  message: Omit<Message, 'id'>
): Promise<Message> => {
  // First check if a conversation exists
  const { data: existingConversation, error: checkError } = await supabase
    .from('conversations')
    .select('id, messages')
    .eq('path_id', pathId)
    .eq('node_id', nodeId)
    .single();
    
  const newMessage = {
    ...message,
    id: Date.now().toString(),
  };
  
  if (checkError && checkError.code === 'PGRST116') {
    // No conversation found, create a new one
    const { error: insertError } = await supabase
      .from('conversations')
      .insert([{
        path_id: pathId,
        node_id: nodeId,
        messages: [newMessage],
      }]);
      
    if (insertError) {
      console.error('Error creating conversation:', insertError);
      throw new Error('Failed to save message');
    }
  } else if (checkError) {
    console.error('Error checking for conversation:', checkError);
    throw new Error('Failed to save message');
  } else {
    // Update existing conversation
    const updatedMessages = [...(existingConversation?.messages || []), newMessage];
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingConversation?.id);
      
    if (updateError) {
      console.error('Error updating conversation:', updateError);
      throw new Error('Failed to save message');
    }
  }
  
  return newMessage;
};

export const generateAIResponse = async (
  pathId: string,
  nodeId: string,
  userMessage: string
): Promise<Message> => {
  // For now, return a simple templated response
  // This would be replaced with a call to a real AI API
  const aiMessage: Omit<Message, 'id'> = {
    sender: 'ai',
    content: `I understand your question about "${userMessage.substring(0, 30)}...". Let me explain more about this concept.`,
    timestamp: new Date().toISOString(),
  };
  
  return saveMessage(pathId, nodeId, aiMessage);
};
