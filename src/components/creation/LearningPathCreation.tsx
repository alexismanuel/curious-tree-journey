
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast({
        title: "Entrer votre objectif d'apprentissage",
        description: "Que voulez-vous apprendre ?",
        variant: "destructive"
      });
      return;
    }
    handleSubmit(goal);
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    setIsCreating(true);

    try {
      onCreatePath(text);
    } catch (error) {
      console.error("Erreur lors de la création du cours :", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du cours.",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      className="w-full mt-[15%] max-w-lg flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col z-10 items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#372EC1] uppercase">Learn Anything</h1>
        <p className="text-xl text-[#6B7280]">Que veux-tu apprendre ?</p>

      </div>

	<div className="z-10 w-full">
	  <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-transparent">
		{/* Example buttons */}
		<div className="flex flex-col gap-2 mb-3 max-w-lg mx-auto w-full">
		  {[
			"Je veux apprendre à créer mon entreprise",
			"Je veux apprendre le développement web"
		  ].map((text, index) => (
			<motion.div
			  key={index}
			  initial={{ backgroundColor: "rgba(255,255,255,0)" }}
			  whileTap={{
				scale: 0.95,
				backgroundColor: "rgba(255,255,255,0.2)"
			  }}
			  whileHover={{ scale: 1.02 }}
			  transition={{
				type: "spring",
				stiffness: 400,
				damping: 17
			  }}
			>
			  <Button
				type="button"
				variant="outline"
				className="w-full text-sm bg-white/80 backdrop-blur-sm border-[#E5E7EB] hover:bg-white/90 justify-start px-4 py-2 text-left break-words whitespace-normal h-auto"
				onClick={() => {
				  setGoal(text);
				  handleSubmit(text);
				}}
			  >
				{text}
			  </Button>
			</motion.div>
		  ))}
		</div>

    <form onSubmit={handleCustomSubmit} className="relative w-full max-w-lg mx-auto">
      <Input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        onFocus={scrollToBottom}
        placeholder="Je veux apprendre le marketing"
        className="h-auto min-h-[3.5rem] px-6 text-lg rounded-full border-2 border-[#E5E7EB] focus-visible:ring-0 focus-visible:border-[#372EC1] bg-white shadow-sm whitespace-normal break-words"
      />
      <Button
        type="submit"
        size="icon"
        variant="default"
        disabled={isCreating}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#372EC1] hover:bg-[#372EC1]/90"
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
    </form>
	  </div>
	</div>
	<div>
<svg className="fixed -bottom-[2%] w-full -z-1" width="393" height="517" viewBox="0 0 393 517" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M300.5 103.757C348.1 116.957 405.33 166.927 428 190.257L433.5 575.257L-41 569.757L-23 165.257C17.8 123.657 97.33 98.9268 132 91.7568C132 91.7568 210.56 77.3468 300.5 103.757Z" fill="#8DDB9B"/>
<path d="M173.79 282.607C180.87 286.547 188.89 288.547 196.98 288.487C205.07 288.467 213.11 286.437 220.24 282.587C224.57 280.227 228.55 286.127 224.77 289.257C216.97 295.487 206.9 298.437 197.01 298.477C187.12 298.477 176.98 295.527 169.22 289.237C165.44 286.047 169.5 280.207 173.79 282.597V282.607Z" fill="#030023"/>
<path d="M247.72 187.017C246.96 186.957 227.01 189.577 222.4 203.517C216.77 220.557 217.41 271.217 246.35 273.637C275.29 276.057 277.9 250.157 278.4 239.257C278.91 228.357 278.62 189.607 247.72 187.007V187.017Z" fill="white"/>
<path d="M253.09 183.097C252.37 183.037 233.32 185.537 228.93 198.847C223.56 215.107 224.16 263.467 251.79 265.777C279.41 268.087 281.9 243.367 282.38 232.967C282.86 222.567 282.59 185.577 253.09 183.097Z" fill="#030023"/>
<path d="M142.79 186.977C142.04 186.867 121.96 188.167 116.44 201.777C109.7 218.407 107 269.007 135.71 273.327C164.43 277.647 168.74 251.977 169.96 241.137C171.18 230.297 173.45 191.607 142.79 186.987V186.977Z" fill="white"/>
<path d="M147.01 185.127C146.29 185.017 127.12 186.257 121.86 199.247C115.43 215.117 112.85 263.417 140.26 267.537C167.67 271.657 171.78 247.157 172.95 236.807C174.12 226.457 176.28 189.537 147.01 185.117V185.127Z" fill="#030023"/>
<path d="M84.8101 38.8775C95.6601 29.5075 111.4 27.3075 125.4 30.3975C139.4 33.4875 151.92 41.2775 163.27 50.0275C174.66 19.5875 207.04 -1.6225 239.49 0.0974993C258.71 1.1175 280.12 13.4675 280.55 32.7175C287.18 22.1475 304.3 22.0875 313.06 30.9775C321.82 39.8675 322.7 54.4475 317.85 65.9475C313 77.4475 303.44 86.2975 293.29 93.5475C272.57 108.348 247.6 118.107 222.14 117.467C186.53 116.567 155.46 96.6975 122.25 86.4275C110.46 82.7775 89.3201 84.3075 79.5101 76.9875C67.1501 67.7575 75.1701 47.2075 84.8001 38.8875L84.8101 38.8775Z" fill="#8DDB9B"/>
</svg>
</div>
    </motion.div>
  );
};

export default LearningPathCreation;
