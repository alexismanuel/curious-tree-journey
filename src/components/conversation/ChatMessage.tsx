
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, User } from "lucide-react";
import { Message } from "@/api/conversations";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAI = message.sender === "ai";
  
  return (
    <motion.div
      className={`flex mb-4 ${isAI ? "justify-start" : "justify-end"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isAI && (
        <Avatar className="w-8 h-8 mr-2">
          <AvatarFallback className="bg-sky-100 text-sky-600">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`${isAI ? "chat-bubble chat-ai" : "chat-bubble chat-user ml-auto"}`}>
        {message.content}
      </div>
      
      {!isAI && (
        <Avatar className="w-8 h-8 ml-2">
          <AvatarFallback className="bg-primary text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
