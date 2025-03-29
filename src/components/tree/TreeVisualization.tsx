
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TreeData, Node } from "@/types/tree";
import { Check, Lock, ChevronRight } from "lucide-react";

interface TreeVisualizationProps {
  treeData: TreeData;
  selectedNode: Node | null;
  onNodeSelect: (node: Node) => void;
}

const TreeVisualization = ({ 
  treeData, 
  selectedNode, 
  onNodeSelect 
}: TreeVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate tree layout and render nodes and branches
  useEffect(() => {
    if (!svgRef.current) return;
    
    // In a real implementation, this would use D3.js or a similar library
    // to calculate the positions of nodes based on the tree structure
  }, [treeData, svgRef]);

  // Render a node
  const renderNode = (node: Node, index: number, level: number) => {
    // Calculate position based on level and index
    // In a real implementation, these calculations would be more sophisticated
    const x = 120 + level * 160;
    const y = 100 + index * 100;
    
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
    
    const isSelected = selectedNode?.id === node.id;
    
    return (
      <motion.g
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: level * 0.1 + index * 0.05 }}
      >
        {/* Branches connecting to children */}
        {node.children?.map((child, childIndex) => {
          const childX = 120 + (level + 1) * 160;
          const childY = 100 + (index + childIndex) * 100;
          
          return (
            <motion.path
              key={`${node.id}-${child.id}`}
              d={`M ${x + 25} ${y} C ${x + 80} ${y}, ${childX - 30} ${childY}, ${childX - 25} ${childY}`}
              fill="none"
              className={`branch ${node.status === "completed" ? "branch-completed" : ""}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: level * 0.2 }}
            />
          );
        })}
        
        {/* Node circle */}
        <motion.circle
          cx={x}
          cy={y}
          r={isSelected ? 30 : 24}
          className={`${statusClass} cursor-pointer transition-all duration-300`}
          onClick={() => onNodeSelect(node)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isSelected ? { boxShadow: "0 0 0 4px rgba(102, 189, 149, 0.3)" } : {}}
        />
        
        {/* Node icon */}
        <g transform={`translate(${x - 8}, ${y - 8})`}>
          {statusIcon}
        </g>
        
        {/* Node title - shown if selected or completed */}
        <motion.text
          x={x}
          y={y + 45}
          textAnchor="middle"
          className="text-xs font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: isSelected || node.status === "completed" ? 1 : 0.7 }}
        >
          {node.title}
        </motion.text>
        
        {/* Render children recursively */}
        {node.children?.map((child, childIndex) => 
          renderNode(child, index + childIndex, level + 1)
        )}
      </motion.g>
    );
  };

  return (
    <div className="w-full h-full overflow-auto">
      <svg
        ref={svgRef}
        width="1200"
        height="600"
        className="min-w-full min-h-full"
      >
        <g transform="translate(40, 20)">
          {renderNode(treeData.rootNode, 0, 0)}
        </g>
      </svg>
    </div>
  );
};

export default TreeVisualization;
