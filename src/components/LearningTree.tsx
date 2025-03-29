
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ReactFlow, 
  Background, 
  Controls,
  useNodesState, 
  useEdgesState,
  MarkerType,
  Node as FlowNode,
  Edge
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Check, 
  Lock, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  Home, 
  Save, 
  Share, 
  Send, 
  RotateCcw, 
  CheckCircle, 
  BookOpen,
  Sparkles,
  User
} from "lucide-react";

import { 
  useTreeStore, 
  Node as TreeNode, 
  NodeStatus, 
  Message,
  useConversation
} from "@/utils/api";

// Progress Indicator Component
const ProgressIndicator = ({ completed, total }: { completed: number; total: number }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} className="w-24 h-2" />
      <span className="text-xs text-muted-foreground">
        {completed}/{total}
      </span>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message }: { message: Message }) => {
  const isAI = message.sender === "ai";
  
  return (
    <motion.div
      className={`flex mb-4 ${isAI ? "justify-start" : "justify-end"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isAI && (
        <Avatar className="w-8 h-8 mr-2">
          <AvatarFallback className="bg-sky-100 text-sky-600">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`${isAI ? "chat-bubble chat-ai" : "chat-bubble chat-user ml-auto"}`}>
        {message.content}
      </div>
      
      {!isAI && (
        <Avatar className="w-8 h-8 ml-2">
          <AvatarFallback className="bg-primary text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

// Conversation Panel Component
const ConversationPanel = ({ node, onComplete }: { node: TreeNode; onComplete: () => void }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(node.status === "completed" ? 100 : 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentPath } = useTreeStore();
  const { toast } = useToast();
  const { messages, isLoading, error, sendMessage } = useConversation(
    currentPath || "", 
    node?.id || ""
  );

  useEffect(() => {
    // Generate initial message if none exists
    const createInitialMessage = async () => {
      if (messages.length === 0 && currentPath && node) {
        setIsTyping(true);
        try {
          await sendMessage(`Let's explore the concept of "${node.title}". ${node.description}. What would you like to know about this topic?`);
        } catch (error) {
          console.error('Error creating initial message:', error);
        } finally {
          setIsTyping(false);
        }
      }
    };
    
    createInitialMessage();
    
    // Update progress based on message count
    if (node.status !== "completed") {
      const progress = Math.min(100, messages.length * 15);
      setProgress(progress);
    } else {
      setProgress(100);
    }
  }, [node, messages.length, currentPath]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentPath) return;
    
    try {
      setIsTyping(true);
      await sendMessage(input);
      setInput("");
      
      // Update progress
      setProgress(prev => Math.min(100, prev + 15));
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <motion.div 
        className="px-4 py-3 border-b"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start">
          <div className="node node-active mr-3 w-8 h-8 flex-shrink-0">
            {node.status === "completed" ? (
              <CheckCircle className="h-4 w-4 text-white" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{node.title}</h3>
            <p className="text-sm text-muted-foreground">{node.description}</p>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Learning Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="chat-bubble chat-ai inline-flex items-center"
            >
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: "600ms" }} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {progress >= 100 ? (
        <motion.div 
          className="p-4 bg-leaf-50 border-t border-leaf-100 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-semibold text-leaf-800 mb-1">
            Concept Mastered! 🎉
          </h4>
          <p className="text-sm text-leaf-600 mb-3">
            You've completed this learning node and unlocked new content
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setProgress(0)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Review Again
            </Button>
            <Button 
              size="sm" 
              className="bg-leaf-500 hover:bg-leaf-600 text-white"
              onClick={onComplete}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Continue Learning
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="p-4 border-t flex gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this concept..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Custom Node Component for ReactFlow
const CustomNode = ({ data }: { data: { node: TreeNode, isSelected: boolean, onSelect: (node: TreeNode) => void } }) => {
  const { node, isSelected, onSelect } = data;
  
  let statusClass = "node-upcoming";
  let statusIcon = <ChevronRight className="h-4 w-4" />;
  
  if (node.status === "completed") {
    statusClass = "node-completed";
    statusIcon = <Check className="h-4 w-4" />;
  } else if (node.status === "active") {
    statusClass = "node-active";
    statusIcon = <ChevronRight className="h-4 w-4" />;
  } else if (node.status === "locked") {
    statusClass = "node-locked";
    statusIcon = <Lock className="h-4 w-4" />;
  }
  
  return (
    <motion.div
      className={`node ${statusClass} w-12 h-12 cursor-pointer`}
      style={{ 
        width: isSelected ? '60px' : '48px', 
        height: isSelected ? '60px' : '48px'
      }}
      onClick={() => onSelect(node)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {statusIcon}
      <div className="absolute top-16 w-40 text-center" style={{ left: '-35px' }}>
        <span className={`text-xs font-medium ${isSelected || node.status === "completed" ? 'opacity-100' : 'opacity-70'}`}>
          {node.title}
        </span>
      </div>
    </motion.div>
  );
};

// Tree Visualization Component
const TreeVisualization = ({ 
  treeData, 
  selectedNode, 
  onNodeSelect 
}: { 
  treeData: import("@/utils/api").TreeData;
  selectedNode: import("@/utils/api").Node | null;
  onNodeSelect: (node: import("@/utils/api").Node) => void;
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodeTypes = { customNode: CustomNode };
  
  // Convert tree data to react-flow nodes and edges
  useEffect(() => {
    if (!treeData) return;
    
    const flowNodes: FlowNode[] = [];
    const flowEdges: Edge[] = [];
    
    // Recursive function to process tree nodes
    const processNode = (node: TreeNode, level: number, index: number, parentId?: string) => {
      // Calculate position
      const x = 150 + level * 200;
      const y = 100 + index * 120;
      
      // Create react-flow node
      flowNodes.push({
        id: node.id,
        type: 'customNode',
        position: { x, y },
        data: {
          node,
          isSelected: selectedNode?.id === node.id,
          onSelect: onNodeSelect
        }
      });
      
      // Create edge from parent to this node
      if (parentId) {
        flowEdges.push({
          id: `e-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          className: `branch ${node.status === "completed" ? "branch-completed" : ""}`,
          type: 'smoothstep',
          animated: node.status === "active",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: node.status === "completed" ? '#84CAAA' : '#A18D7D',
          },
        });
      }
      
      // Process children
      if (node.children) {
        node.children.forEach((child, childIndex) => {
          processNode(child, level + 1, index + childIndex * 0.6, node.id);
        });
      }
    };
    
    // Start processing from root node
    processNode(treeData.rootNode, 0, 0);
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [treeData, selectedNode, onNodeSelect]);
  
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-transparent"
        minZoom={0.5}
        maxZoom={1.5}
        attributionPosition="bottom-right"
      >
        <Controls showInteractive={false} position="bottom-right" />
        <Background color="#a18d7d" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

// Main Tree View Component
const MainTreeView = ({ learningGoal }: { learningGoal: string }) => {
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

  const handleNodeSelect = (node: TreeNode) => {
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
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
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

// Path View Component (main page)
const PathView = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    learningGoal,
    treeData,
    isLoading,
    error,
    fetchPath
  } = useTreeStore();

  useEffect(() => {
    if (pathId) {
      fetchPath(pathId);
    }
  }, [pathId, fetchPath]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-leaf-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Path Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find the learning path you're looking for.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <MainTreeView learningGoal={learningGoal} />
    </div>
  );
};

export { PathView };
