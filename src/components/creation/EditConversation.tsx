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

interface EditConversationProps {
  treeData: TreeData;
  onStart: () => Promise<void>;
  onSubmit: (details: string) => Promise<void>;
}

export const EditConversation = ({ treeData, onStart, onSubmit }: EditConversationProps) => {
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);

  useEffect(() => {
    const plan = getFromLocalStorage("coursePlan", null);
    if (plan) {
      setCoursePlan(plan);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoading) return;

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(goal);
      }
    } catch (error) {
      console.error("Error modifying course:", error);
    } finally {
      setGoal("");
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
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-lg">
            Super choix ! Voici le déroulé de votre formation :
          </p>

          <div className="space-y-3 pl-4">
            {coursePlan?.chapters?.map((chapter, index: number) => (
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

          <div className="flex justify-center pt-4">
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

      <form onSubmit={handleSubmit} className="sticky bottom-0 left-0 right-0 p-4 bg-white">
        <div className="max-w-xl mx-auto">
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Je veux modifier la formation"
            className="w-full h-14 px-4 text-base border rounded-full"
          />
        </div>
      </form>
    </motion.div>
  );
};
