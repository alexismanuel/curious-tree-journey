
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sendCreateCourse from "@/api/webhook";

interface LearningPathCreationProps {
  onCreatePath: (goal: string) => void;
}

const suggestions = [
"Apprendre la programmation Python",
"Comprendre la physique quantique",
"Maîtriser les fondamentaux du marketing digital",
"Apprendre à jouer de la guitare",
"Comprendre les concepts de l’apprentissage automatique",
"Histoire de l’art de la Renaissance"
];

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
      const response = await sendCreateCourse(goal);
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
      className="max-w-3xl w-full mx-auto glassmorphic rounded-2xl p-8 md:p-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-bark-900">
          Que voulez-vous apprendre ?
        </h1>
        <p className="text-muted-foreground text-lg">
          Entrer un sujet, une compétence ou un thème pour créer votre parcours d'apprentissage personnalisé
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Learn JavaScript fundamentals"
              className="pl-10 py-6 text-lg"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isCreating} 
            className="bg-leaf-500 hover:bg-leaf-600 text-white"
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
      </form>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Or try one of these suggestions:
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Button 
                variant="outline"
                className="text-sm"
                onClick={() => setGoal(suggestion)}
              >
                {suggestion}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
        Nous créerons un parcours d'apprentissage personnalisé avec des nœuds interactifs pour guider votre voyage.
        </p>
      </div>
    </motion.div>
  );
};

export default LearningPathCreation;
