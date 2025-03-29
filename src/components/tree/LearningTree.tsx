import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CheckCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { TreeData } from "@/types/tree";
import { TreeVisualization } from "./TreeVisualization";
import { ConversationPanel } from "./ConversationPanel";

const ProgressIndicator = ({ completed, total }: { completed: number; total: number }) => (
  <div className="flex items-center gap-4">
    <Progress value={(completed / total) * 100} className="flex-1" />
    <span className="text-sm text-muted-foreground">
      {completed}/{total} completed
    </span>
  </div>
);

export const PathView = ({ learningGoal, treeData }: { learningGoal: string; treeData: TreeData }) => {
  const [activeNode, setActiveNode] = useState<typeof treeData.rootNode | null>(null);
  const { toast } = useToast();
  
  // Calculate progress
  const totalNodes = treeData.nodes.length;
  const completedNodes = treeData.nodes.filter(node => node.status === "completed").length;
  
  const handleNodeSelect = (node: typeof activeNode) => {
    if (node.status === "locked") {
      toast({
        title: "Node Locked",
        description: "Complete the previous nodes to unlock this one.",
        variant: "destructive"
      });
      return;
    }
    setActiveNode(node);
  };
  
  const handleCompleteNode = () => {
    if (!activeNode) return;

    const updatedNodes = treeData.nodes.map(node => {
      if (node.id === activeNode.id) {
        return { ...node, status: "completed" as const };
      }
      // Unlock children of completed node
      if (activeNode.children.some(child => child.id === node.id)) {
        return { ...node, status: node.status === "locked" ? "upcoming" as const : node.status };
      }
      return node;
    });
    
    treeData.nodes = updatedNodes;
    toast({
      title: "Node Completed",
      description: "Great job! You can now move on to the next topic.",
    });
  };
  
  return (
    <div className="h-full min-h-[600px] w-full">
      <div className="h-full flex flex-col">
        <header className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <h1 className="text-xl font-semibold">{learningGoal}</h1>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <ProgressIndicator completed={completedNodes} total={totalNodes} />
        </header>
        
        <div className="flex-1 p-4 max-w-[2000px] mx-auto w-full relative">
          <AnimatePresence mode="wait">
            {!activeNode ? (
              <motion.div 
                key="tree"
                className="h-[calc(100vh-12rem)] glassmorphic rounded-xl p-4 overflow-hidden flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TreeVisualization
                  treeData={treeData}
                  selectedNode={activeNode}
                  onNodeSelect={handleNodeSelect}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                className="h-[calc(100vh-12rem)] glassmorphic rounded-xl overflow-hidden flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute top-6 left-6 z-10">
                  <button
                    onClick={() => setActiveNode(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span>Back to Tree</span>
                  </button>
                </div>
                <ConversationPanel
                  key={activeNode.id}
                  node={activeNode}
                  onComplete={() => {
                    handleCompleteNode();
                    setActiveNode(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
