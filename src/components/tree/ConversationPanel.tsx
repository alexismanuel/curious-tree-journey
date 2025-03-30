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
      className={`flex gap-3 px-3 py-2 ${isAI ? "" : "flex-row-reverse"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>{isAI ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col gap-1.5 ${isAI ? "items-start" : "items-end"}`}>
        <div className={`rounded-lg px-4 py-2.5 ${isAI ? "bg-secondary/80" : "bg-primary text-primary-foreground"}`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <span className="text-[11px] text-muted-foreground/80 px-1">{message.timestamp}</span>
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
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
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
        timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
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
    <div className="flex flex-col h-full max-w-2xl mx-auto px-6 pb-1.5 pt-6 relative">
      {/* Header */}
      <div className="mb-6 relative">
        <h1 className="text-xl font-semibold text-center mb-1">{node.title}</h1>
        <Button
          variant="secondary"
          className="absolute right-0 -top-1 px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium"
          onClick={() => onComplete()}
        >
          Chapitre terminé
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 -mx-2">
        <AnimatePresence mode="popLayout">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>En réfléxion...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="icon"
            className="h-320 w-320 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center"
            onClick={onBack}
          >
        <svg width="852" height="852" viewBox="0 0 852 852" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_83_1109)">
              <circle cx="426" cy="426" r="386" fill="#C7D7F6"/>
            </g>
            <path d="M411.343 74.2024C378.427 197.046 608.874 324.472 575.958 447.316C543.042 570.159 243.93 596.32 211.014 719.164" 
              stroke="currentColor" 
              strokeWidth="29.3164" 
              strokeMiterlimit="10" 
              strokeLinecap="round" 
              strokeDasharray="48.86 48.86"
            />
            <circle 
              cx="576.586" 
              cy="440.131" 
              r="81.4881" 
              transform="rotate(15 576.586 440.131)" 
              fill="currentColor"
            />
            <defs>
              <filter 
                id="filter0_d_83_1109" 
                x="0.911907" 
                y="0.911419" 
                width="850.177" 
                height="850.177" 
                filterUnits="userSpaceOnUse" 
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix 
                  in="SourceAlpha" 
                  type="matrix" 
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" 
                  result="hardAlpha"
                />
                <feOffset/>
                <feGaussianBlur stdDeviation="19.5443"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_83_1109"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_83_1109" result="shape"/>
              </filter>
            </defs>
          </svg> 
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
