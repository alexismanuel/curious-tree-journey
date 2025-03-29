import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, User, Sparkles, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, Node } from "@/types/tree";
import { generateInitialMessages } from "@/lib/conversation-generator";
import { chatWithAI } from "@/api/webhook";

const ChatMessage = forwardRef<HTMLDivElement, { message: Message }>((props, ref) => {
  const { message } = props;
  const isAI = message.sender === "ai";

  return (
    <motion.div
      ref={ref}
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback>{isAI ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col gap-1 ${isAI ? "items-start" : "items-end"}`}>
        <div className={`rounded-lg px-3 py-2 ${isAI ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
          <p className="text-base">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";

export const ConversationPanel = ({ 
  node, 
  onComplete,
  onBack
}: { 
  node: Node; 
  onComplete: () => void;
  onBack: () => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessages = generateInitialMessages(node);
    setMessages(initialMessages);
  }, [node]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
  
    // Création et ajout du message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
  
    try {
      // Appel à l'API avec le contexte et le message utilisateur
      // Ici, j'assume que "node" possède une propriété "context" que vous transmettez.
      const response = await chatWithAI("Tu es un assistant sympas", userMessage.content);
  
      // Construction du message AI en fonction de la réponse (adaptez "response.reply" selon votre API)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: response, // Adaptez cette propriété en fonction de la réponse de votre API
        timestamp: new Date().toLocaleTimeString()
      };
  
      // Ajout du message AI dans la conversation
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erreur lors de l'appel à chatWithAI:", error);
      // Vous pouvez également afficher un message d'erreur dans l'interface ici
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-6 relative">
      {/* Header */}
      <div className="mb-8 relative">
        <h1 className="text-xl font-semibold text-center">{node.title}</h1>
        <Button
          variant="secondary"
          className="absolute right-0 top-0 px-4 py-2 bg-black text-white rounded-full text-sm"
          onClick={() => onComplete()}
        >
          Chapitre terminé
        </Button>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-2 text-md text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>En réfléxion...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-secondary/10 hover:bg-secondary/20"
            onClick={onBack}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
