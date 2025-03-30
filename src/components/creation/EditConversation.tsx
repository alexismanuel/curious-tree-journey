import { useState, useRef, useEffect, forwardRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, User, Sparkles, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, Node, TreeData, CoursePlan } from "@/types/tree";
import { generateInitialMessages } from "@/lib/conversation-generator";
import { chatWithAI } from "@/api/webhook";
import { getFromLocalStorage } from "@/utils/localStorage";

const ChatMessage = forwardRef<HTMLDivElement, { message: Message; coursePlan?: CoursePlan | null }>((props, ref) => {
  const { message, coursePlan } = props;
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
          {isAI && message.isInitial && coursePlan ? (
            <div className="space-y-4">
              <p className="text-lg">Super choix ! Voici le déroulé de votre formation :</p>
              <div className="space-y-3 pl-4">
                {coursePlan.chapters.map((chapter, index) => (
                  <div key={chapter.id || index} className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <p><strong>Chapitre {index + 1} :</strong> {chapter.title}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 space-y-4">
                <p>N'hésitez pas à me demander si vous voulez plus de détails ou des modifications.</p>
                <p>Si vous êtes satisfait, on peut commencer dès maintenant !</p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground/80 px-1">{message.timestamp}</span>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";

interface EditConversationProps {
  treeData: TreeData;
  onStart: () => Promise<void>;
  onSubmit: (details: string) => Promise<void>;
}

export const EditConversation = ({ treeData, onStart, onSubmit }: EditConversationProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plan = getFromLocalStorage("coursePlan", null);
    if (plan) {
      setCoursePlan(plan);
      // Add initial AI message
      const initialMessage: Message & { isInitial?: boolean } = {
        id: Date.now().toString(),
        sender: "ai",
        content: "", // Content will be rendered by the ChatMessage component
        timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
        isInitial: true
      };
      setMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
      if (onSubmit) {
        await onSubmit(userMessage.content);
      }
    } catch (error) {
      console.error("Error modifying course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await onStart();
    } catch (error) {
      console.error("Error starting course:", error);
    }
  };


  return (
    <motion.div
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} coursePlan={coursePlan} />
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>En réflexion...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex justify-center pt-8">
            <Button
              onClick={handleStart}
              className="bg-black text-white hover:bg-black/90 px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                "C'est parti !"
              )}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Je veux modifier la formation"
              className="flex-1 h-14 px-4 text-base border rounded-full"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 rounded-full"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
