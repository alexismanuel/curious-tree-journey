
import { useState } from "react";
import { motion } from "framer-motion";
import LearningPathCreation from "@/components/creation/LearningPathCreation";
import { PersonalizationForm } from "@/components/creation/PersonalizationForm";
import { PathView } from "@/components";
import { generateInitialTree } from "@/lib/tree-generator";
import { ProgressDots } from "@/components/ui/progress-dots";
import { sendCreateCourse } from "@/api/webhook";

const Index = () => {
  const [stage, setStage] = useState<"creation" | "personalization" | "tree">("creation");
  const [learningGoal, setLearningGoal] = useState<string>("");
  const [treeData, setTreeData] = useState<any>(null);

  const handleCreatePath = (goal: string) => {
    setLearningGoal(goal);
    setStage("personalization");
  };

  const handlePersonalization = async (details: string) => {

    // Fusionne le but d'apprentissage et les détails de personnalisation
    const personalizedGoal = `${learningGoal} ${details}`;
    console.log("Personalized Goal:", personalizedGoal);
    const response = await sendCreateCourse(personalizedGoal);
    // Generate a tree locally without persisting
    const initialTree = generateInitialTree(response);
    setTreeData(initialTree);

    // Show the tree visualization
    setStage("tree");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Minimal background */}
      <div className="inset-0 overflow-hidden">
        <div
          className="-translate-x-1/2 w-full h-full bg-muted rounded-full blur-3xl opacity-10 -z-10"
        />
      </div>

      {/* Progress dots */}
      {(stage === "creation" || stage === "personalization") && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-20">
          <ProgressDots
            totalSteps={2}
            currentStep={stage === "creation" ? 1 : 2}
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="flex-1 flex items-start sm:items-center justify-center px-4 relative z-10 pt-4 sm:pt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stage === "creation" && <LearningPathCreation onCreatePath={handleCreatePath} />}
        {stage === "personalization" && <PersonalizationForm goal={learningGoal} onSubmit={handlePersonalization} />}
        {stage === "tree" && <PathView learningGoal={learningGoal} treeData={treeData} />}
      </motion.div>
    </div>
  );
};

export default Index;
