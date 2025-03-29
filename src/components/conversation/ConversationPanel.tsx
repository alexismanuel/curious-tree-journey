
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Node } from "@/types/tree";
import { Send, Sparkles, BookOpen, CheckCircle, RotateCcw } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useTreeStore } from "@/store/useTreeStore";
import { fetchConversation, saveMessage, generateAIResponse, Message } from "@/api/conversations";
import { useToast } from "@/hooks/use-toast";

interface ConversationPanelProps {
  node: Node;
  onComplete: () => void;
}

const ConversationPanel = ({ node, onComplete }: ConversationPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(node.status === "completed" ? 100 : 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentPath } = useTreeStore();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize conversation based on node
    const loadMessages = async () => {
      if (!currentPath) return;
      
      try {
        setIsTyping(true);
        const conversationMessages = await fetchConversation(currentPath, node.id);
        
        if (conversationMessages.length === 0) {
          // If no conversation exists, generate initial message
          const initialMessage: Omit<Message, 'id'> = {
            sender: 'ai',
            content: `Let's explore the concept of "${node.title}". ${node.description}. What would you like to know about this topic?`,
            timestamp: new Date().toISOString(),
          };
          
          const savedMessage = await saveMessage(currentPath, node.id, initialMessage);
          setMessages([savedMessage]);
        } else {
          setMessages(conversationMessages);
        }
        
        // Update progress based on message count
        if (node.status !== "completed") {
          const progress = Math.min(100, conversationMessages.length * 15);
          setProgress(progress);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive"
        });
      } finally {
        setIsTyping(false);
      }
    };
    
    // Reset progress based on node status
    setProgress(node.status === "completed" ? 100 : 0);
    
    loadMessages();
  }, [node, currentPath, toast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentPath) return;
    
    try {
      // Add user message
      const userMessage: Omit<Message, 'id'> = {
        sender: "user",
        content: input,
        timestamp: new Date().toISOString()
      };
      
      const savedUserMessage = await saveMessage(currentPath, node.id, userMessage);
      setMessages(prev => [...prev, savedUserMessage]);
      setInput("");
      
      // Simulate AI typing
      setIsTyping(true);
      
      // Generate AI response
      const aiMessage = await generateAIResponse(currentPath, node.id, input);
      setMessages(prev => [...prev, aiMessage]);
      
      // Update progress
      setProgress(prev => Math.min(100, prev + 15));
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <motion.div 
        className="px-4 py-3 border-b"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start">
          <div className="node node-active mr-3 w-8 h-8 flex-shrink-0">
            {node.status === "completed" ? (
              <CheckCircle className="h-4 w-4 text-white" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{node.title}</h3>
            <p className="text-sm text-muted-foreground">{node.description}</p>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Learning Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="chat-bubble chat-ai inline-flex items-center"
            >
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: "600ms" }} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {progress >= 100 ? (
        <motion.div 
          className="p-4 bg-leaf-50 border-t border-leaf-100 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-semibold text-leaf-800 mb-1">
            Concept Mastered! 🎉
          </h4>
          <p className="text-sm text-leaf-600 mb-3">
            You've completed this learning node and unlocked new content
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setProgress(0)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Review Again
            </Button>
            <Button 
              size="sm" 
              className="bg-leaf-500 hover:bg-leaf-600 text-white"
              onClick={onComplete}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Continue Learning
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="p-4 border-t flex gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this concept..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationPanel;
