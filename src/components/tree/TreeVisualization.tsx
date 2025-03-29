
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TreeData, Node as TreeNode, NodeStatus } from "@/types/tree";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType,
  Position,
  Node,
  Edge,
  ConnectionLineType
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Check, Lock, ChevronRight } from "lucide-react";

interface TreeVisualizationProps {
  treeData: TreeData;
  selectedNode: TreeNode | null;
  onNodeSelect: (node: TreeNode) => void;
}

// Custom node renderer component
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

const nodeTypes = {
  customNode: CustomNode,
};

const TreeVisualization = ({ 
  treeData, 
  selectedNode, 
  onNodeSelect 
}: TreeVisualizationProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Convert tree data to react-flow nodes and edges
  useEffect(() => {
    if (!treeData) return;
    
    const flowNodes: Node[] = [];
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
  
  // When a node or an edge is clicked
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // The click handler is handled in the CustomNode component
  }, []);
  
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
        connectionLineType={ConnectionLineType.SmoothStep}
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

export default TreeVisualization;
