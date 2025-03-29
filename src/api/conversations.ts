
// Mock implementation using localStorage instead of Supabase
export type Message = {
  id: string;
  sender: "ai" | "user";
  content: string;
  timestamp: string;
};

type Conversation = {
  path_id: string;
  node_id: string;
  messages: Message[];
  updated_at?: string;
};

// Helper function to get all conversations from local storage
const getConversationsFromStorage = (): Conversation[] => {
  try {
    const conversations = localStorage.getItem('conversations');
    return conversations ? JSON.parse(conversations) : [];
  } catch (e) {
    console.error('Error reading conversations from localStorage:', e);
    return [];
  }
};

// Helper function to save conversations to local storage
const saveConversationsToStorage = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  } catch (e) {
    console.error('Error saving conversations to localStorage:', e);
  }
};

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
        updated_at: new Date().toISOString()
      });
    } else {
      // Update existing conversation
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        messages: [...conversations[conversationIndex].messages, newMessage],
        updated_at: new Date().toISOString()
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
  // For now, return a simple templated response
  // This would be replaced with a call to a real AI API
  const aiMessage: Omit<Message, 'id'> = {
    sender: 'ai',
    content: `I understand your question about "${userMessage.substring(0, 30)}...". Let me explain more about this concept.`,
    timestamp: new Date().toISOString(),
  };
  
  return saveMessage(pathId, nodeId, aiMessage);
};
