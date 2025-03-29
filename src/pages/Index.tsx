
import { useState } from "react";
import { motion } from "framer-motion";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import LearningPathCreation from "@/components/creation/LearningPathCreation";
import { PathView } from "@/components";
import { generateInitialTree } from "@/lib/tree-generator";

const Index = () => {
  const [stage, setStage] = useState<"creation" | "tree">("creation");
  const [learningGoal, setLearningGoal] = useState<string>("");
  const [treeData, setTreeData] = useState<any>(null);

  const handleCreatePath = (goal: string) => {
    setLearningGoal(goal);
    
    // Generate a tree locally without persisting
    const initialTree = generateInitialTree(goal);
    setTreeData(initialTree);
    
    // Show the tree visualization
    setStage("tree");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Minimal background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] bg-muted rounded-full blur-3xl opacity-10 -z-10" 
        />
      </div>

      {/* Content */}
      <motion.div 
        className="flex-1 flex items-center justify-center px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stage === "creation" && <LearningPathCreation onCreatePath={handleCreatePath} />}
        {stage === "tree" && <PathView learningGoal={learningGoal} treeData={treeData} />}
      </motion.div>
    </div>
  );
};

export default Index;
