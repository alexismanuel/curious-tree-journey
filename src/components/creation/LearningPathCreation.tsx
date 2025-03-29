
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
      //const response = await sendCreateCourse(goal);
      // Tu peux utiliser la réponse ici
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
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 sm:gap-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Learn Anything</h1>
        <p className="text-xl text-muted-foreground">Que voulez vous apprendre ?</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Je veux apprendre..."
              className="h-14 px-4 text-lg ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button 
              type="submit" 
              size="icon"
              variant="default"
              disabled={isCreating}
              className="absolute right-2 top-2 h-10 w-10 bg-primary hover:bg-primary/90"
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
