
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LearningPathCreationProps {
  onCreatePath: (goal: string) => void;
}

const LearningPathCreation = ({ onCreatePath }: LearningPathCreationProps) => {
  const [goal, setGoal] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const scrollToBottom = useScrollToBottom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal.trim()) {
      toast({
        title: "Entrer votre objectif d'apprentissage",
        description: "Que voulez-vous apprendre ?",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      onCreatePath(goal);

    } catch (error) {
      console.error("Erreur lors de la création du cours :", error);
      // Gère l'erreur côté UI si besoin
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du cours.",
        variant: "destructive"
      });
      setIsCreating(false);
      return;
    }
  };

  return (
    <motion.div
      className="w-full my-auto max-w-lg mx-auto flex flex-col items-center gap-8 sm:gap-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Learn Anything</h1>
        <p className="text-xl text-muted-foreground">Que voulez vous apprendre ?</p>
      </div>

	<form onSubmit={handleSubmit} className="w-full">
	  <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-white">
		<div className="relative w-full">
		  <Input
			value={goal}
			onChange={(e) => setGoal(e.target.value)}
			onFocus={scrollToBottom}
			placeholder="Je veux apprendre le marketing digital ..."
			className="h-14 px-4 text-lg pr-12 border-2 focus-visible:ring-0 focus-visible:border-gray-400"
		  />
		  <Button
			type="submit"
			size="icon"
			variant="default"
			disabled={isCreating}
			className="absolute right-1 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary hover:bg-primary/90"
		  >
			{isCreating ? (
			  <motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
			  >
				<Sparkles className="h-5 w-5" />
			  </motion.div>
			) : (
			  <ArrowRight className="h-5 w-5" />
			)}
		  </Button>
		</div>
	  </div>
	</form>
    </motion.div>
  );
};

export default LearningPathCreation;
