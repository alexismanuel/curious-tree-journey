
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TreeVisualization from "./TreeVisualization";
import ConversationPanel from "../conversation/ConversationPanel";
import ProgressIndicator from "../progress/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTreeStore } from "@/store/useTreeStore";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Home, Save, Share, Loader2 } from "lucide-react";

interface MainTreeViewProps {
  learningGoal: string;
}

const MainTreeView = ({ learningGoal }: MainTreeViewProps) => {
  const { 
    treeData, 
    activeNode, 
    isLoading, 
    setActiveNode, 
    completeNode,
    savePath,
    currentPath
  } = useTreeStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNodeSelect = (node) => {
    if (node.status === "locked") {
      toast({
        title: "Node Locked",
        description: "Complete the previous nodes to unlock this one",
        variant: "destructive",
      });
      return;
    }
    
    setActiveNode(node);
  };

  const handleCompleteNode = () => {
    if (!activeNode) return;
    
    completeNode(activeNode.id);
    
    toast({
      title: "Node Completed! 🎉",
      description: "Great job! You've mastered this concept.",
    });
  };

  const handleSave = async () => {
    if (!currentPath) {
      toast({
        title: "Not logged in",
        description: "Log in to save your progress",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await savePath();
      toast({
        title: "Progress saved",
        description: "Your learning progress has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4 relative">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-leaf-200 border-t-leaf-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-muted-foreground">Creating your personalized learning path...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <motion.div 
        className="flex justify-between items-center mb-4 px-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate(currentPath ? "/dashboard" : "/")}
          >
            <Home className="h-4 w-4 mr-2" />
            {currentPath ? "Dashboard" : "Home"}
          </Button>
          <div className="text-muted-foreground">
            /<span className="ml-2 font-medium text-foreground">{learningGoal}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </motion.div>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <motion.div 
          className="lg:w-2/3 glassmorphic rounded-xl p-4 overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-bark-900">
              Your Learning Path
            </h2>
            <ProgressIndicator 
              completed={treeData?.nodes.filter(n => n.status === "completed").length || 0}
              total={treeData?.nodes.length || 0}
            />
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {treeData && (
              <TreeVisualization 
                treeData={treeData} 
                selectedNode={activeNode}
                onNodeSelect={handleNodeSelect}
              />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:w-1/3 glassmorphic rounded-xl overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {activeNode && (
              <ConversationPanel 
                key={activeNode.id}
                node={activeNode}
                onComplete={handleCompleteNode}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MainTreeView;
