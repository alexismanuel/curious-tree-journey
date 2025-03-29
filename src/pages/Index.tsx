
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import LearningPathCreation from "@/components/creation/LearningPathCreation";
import MainTreeView from "@/components/tree/MainTreeView";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useTreeStore } from "@/store/useTreeStore";

const Index = () => {
  const [stage, setStage] = useState<"welcome" | "auth" | "creation" | "tree">("welcome");
  const { user, isLoading: authLoading } = useAuth();
  const { learningGoal, setLearningGoal, createPath } = useTreeStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle redirect with state from other pages
  useEffect(() => {
    if (location.state?.learningGoal) {
      setLearningGoal(location.state.learningGoal);
      setStage("creation");
    }
  }, [location.state, setLearningGoal]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user && stage === "auth") {
      navigate("/dashboard");
    }
  }, [authLoading, user, stage, navigate]);

  const handleGetStarted = () => {
    if (user) {
      setStage("creation");
    } else {
      setStage("auth");
    }
  };

  const handleCreatePath = async (goal: string) => {
    setLearningGoal(goal);
    
    if (user) {
      // If authenticated, create in database and redirect to path view
      const pathId = await createPath(goal);
      if (pathId) {
        navigate(`/path/${pathId}`);
      } else {
        setStage("tree");
      }
    } else {
      // If not authenticated, just show demo tree
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
        {stage === "auth" && <AuthForm />}
        {stage === "creation" && <LearningPathCreation onCreatePath={handleCreatePath} />}
        {stage === "tree" && <MainTreeView learningGoal={learningGoal} />}
      </motion.div>
    </div>
  );
};

export default Index;
