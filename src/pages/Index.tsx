
import { useState } from "react";
import { motion } from "framer-motion";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import LearningPathCreation from "@/components/creation/LearningPathCreation";
import { PathView } from "@/components";
import { generateInitialTree } from "@/lib/tree-generator";

const Index = () => {
  const [stage, setStage] = useState<"welcome" | "creation" | "tree">("welcome");
  const [learningGoal, setLearningGoal] = useState<string>("");
  const [treeData, setTreeData] = useState<any>(null);

  const handleGetStarted = () => {
    setStage("creation");
  };

  const handleCreatePath = (goal: string) => {
    setLearningGoal(goal);
    
    // Generate a tree locally without persisting
    const initialTree = generateInitialTree(goal);
    setTreeData(initialTree);
    
    // Show the tree visualization
    setStage("tree");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-leaf-50 via-white to-blossom-50 sm:bg-none overflow-hidden">
      {/* Decorative background elements */}
      <div 
        className="floating-circle bg-leaf-200 hidden sm:block" 
        style={{ 
          width: "min(500px, 80vw)", 
          height: "min(500px, 80vw)", 
          top: "-100px", 
          right: "-100px" 
        }}
      />
      <div 
        className="floating-circle bg-blossom-200 hidden sm:block" 
        style={{ 
          width: "min(400px, 70vw)", 
          height: "min(400px, 70vw)", 
          bottom: "-50px", 
          left: "-100px" 
        }}
      />
      <div 
        className="floating-circle bg-sky-200 hidden sm:block" 
        style={{ 
          width: "min(300px, 60vw)", 
          height: "min(300px, 60vw)", 
          top: "40%", 
          left: "60%" 
        }}
      />

      {/* Content */}
      <motion.div 
        className="flex-1 flex items-center justify-center px-4 relative z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stage === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} />}
        {stage === "creation" && <LearningPathCreation onCreatePath={handleCreatePath} />}
        {stage === "tree" && <PathView learningGoal={learningGoal} treeData={treeData} />}
      </motion.div>
    </div>
  );
};

export default Index;
