import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { TreeData, Node } from "@/types/tree";
import { TreeVisualization } from "./TreeVisualization";
import { ConversationPanel } from "./ConversationPanel";
import { LoadingBarChapter } from "../ui/LoadingBarChapter";
import { sendCreateCourse } from "@/api/webhook";
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage";

export const PathView = ({
  learningGoal,
  treeData: initialTreeData
}: {
  learningGoal: string;
  treeData: TreeData;
}) => {
  const [treeData, setTreeData] = useState<TreeData>(initialTreeData);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calcul de la progression
  const totalNodes = treeData.nodes.length;
  const completedNodes = treeData.nodes.filter(node => node.status === "completed").length;

  const handleNodeSelect = (node: Node) => {
    const latestNode = treeData.nodes.find(n => n.id === node.id);
    if (!latestNode) return;

    if (latestNode.status === "locked") {
      toast({
        title: "Node Locked",
        description: "Complétez le chapitre précédent pour avancer.",
        variant: "destructive"
      });
      return;
    }
    setActiveNode(latestNode);
  };

  const handleCompleteNode = () => {
    if (!activeNode) return;

    const updatedNodes = treeData.nodes.map(node => {
      if (node.id === activeNode.id) {
        return { ...node, status: "completed" as const };
      }
      if (activeNode.children.some(child => child.id === node.id)) {
        return { ...node, status: node.status === "locked" ? "upcoming" as const : node.status };
      }
      return node;
    });

    setTreeData({
      ...treeData,
      nodes: updatedNodes,
      rootNode: updatedNodes.find(node => node.id === treeData.rootNode.id) || treeData.rootNode
    });

    toast({
      title: "Node Completed",
      description: "Great job! You can now move on to the next topic.",
    });
  };

  // Nouveau : création du cours dès le montage du composant
  useEffect(() => {
    const initCourse = async () => {
      setIsLoading(true);
      try {
        const planJSON = getFromLocalStorage("coursePlan", null);
        if (!planJSON) {
          throw new Error("No course plan found");
        }
        const courseData = await sendCreateCourse(planJSON);
        saveToLocalStorage("courseData", courseData);
      } catch (error) {
        console.error(error);
        toast({
          title: "Erreur lors de la création du cours",
          description: "Une erreur s'est produite lors de la sauvegarde des données.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    initCourse();
  }, [toast]);

  return (
    <div className="h-full min-h-[600px] w-full">
      <div className="h-full mx-auto flex flex-col">
        <header>
          <h1 className="text-xl font-semibold text-center">{learningGoal}</h1>
        </header>
        <div className="flex-1 p-4 max-w-[2000px] mx-auto w-full relative">
          <AnimatePresence mode="wait">
            {!activeNode ? (
              <motion.div
                key="tree"
                className="h-[calc(100vh-12rem)] p-4 overflow-hidden flex flex-col"
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
                className="h-[calc(100vh-12rem)] overflow-hidden flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ConversationPanel
                  key={activeNode.id}
                  node={activeNode}
                  onComplete={() => {
                    handleCompleteNode();
                    setActiveNode(null);
                  }}
                  onBack={() => setActiveNode(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isLoading && <LoadingBarChapter />}
      </div>
    </div>
  );
};
