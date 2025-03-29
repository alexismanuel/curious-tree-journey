
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import LearningPathCreation from "@/components/creation/LearningPathCreation";
import { useTreeStore } from "@/utils/api";
import { PathView } from "@/components/LearningTree";

const Index = () => {
  const [stage, setStage] = useState<"welcome" | "creation" | "tree">("welcome");
  const { learningGoal, setLearningGoal, createPath } = useTreeStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle redirect with state from other pages
  if (location.state?.learningGoal) {
    setLearningGoal(location.state.learningGoal);
    setStage("creation");
  }

  const handleGetStarted = () => {
    setStage("creation");
  };

  const handleCreatePath = async (goal: string) => {
    setLearningGoal(goal);
    
    // For demo, we'll create a path locally and then show it
    // Before redirecting to the full path view
    const pathId = await createPath(goal);
    
    if (pathId) {
      navigate(`/path/${pathId}`);
    } else {
      setStage("tree");
    }
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
        {stage === "tree" && <PathView />}
      </motion.div>
    </div>
  );
};

export default Index;
