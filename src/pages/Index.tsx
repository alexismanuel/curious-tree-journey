
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
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Decorative background elements */}
      <div 
        className="floating-circle bg-leaf-200" 
        style={{ width: "500px", height: "500px", top: "-100px", right: "-100px" }}
      />
      <div 
        className="floating-circle bg-blossom-200" 
        style={{ width: "400px", height: "400px", bottom: "-50px", left: "-100px" }}
      />
      <div 
        className="floating-circle bg-sky-200" 
        style={{ width: "300px", height: "300px", top: "40%", left: "60%" }}
      />

      {/* Content */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10"
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
