import { motion } from "framer-motion";
import { Check, Lock, ChevronRight } from "lucide-react";
import { Node } from "@/types/tree";

export const CustomNode = ({ data }: { data: { node: Node, isSelected: boolean, onSelect: (node: Node) => void } }) => {
  const { node, isSelected, onSelect } = data;
  
  let statusClass = "node-upcoming";
  let statusIcon = <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />;
  
  if (node.status === "completed") {
    statusClass = "node-completed";
    statusIcon = <Check className="h-3 w-3 sm:h-4 sm:w-4" />;
  } else if (node.status === "active") {
    statusClass = "node-active";
    statusIcon = <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />;
  } else if (node.status === "locked") {
    statusClass = "node-locked";
    statusIcon = <Lock className="h-3 w-3 sm:h-4 sm:w-4" />;
  }
  
  const screenWidth = window.innerWidth;
  const nodeSize = {
    small: { width: '36px', height: '36px' },
    large: { width: screenWidth >= 1536 ? '56px' : '48px', height: screenWidth >= 1536 ? '56px' : '48px' },
    selected: { width: screenWidth >= 1536 ? '64px' : '44px', height: screenWidth >= 1536 ? '64px' : '44px' }
  };
  
  return (
    <motion.div
      className={`node ${statusClass} cursor-pointer`}
      style={{ 
        width: isSelected ? nodeSize.selected.width : window.innerWidth < 640 ? nodeSize.small.width : nodeSize.large.width,
        height: isSelected ? nodeSize.selected.height : window.innerWidth < 640 ? nodeSize.small.height : nodeSize.large.height
      }}
      onClick={() => onSelect(node)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {statusIcon}
      <div className="absolute top-12 sm:top-16 w-32 sm:w-40 text-center" style={{ left: '-50%' }}>
        <span className={`text-[10px] sm:text-xs font-medium truncate block ${isSelected || node.status === "completed" ? 'opacity-100' : 'opacity-70'}`}>
          {node.title}
        </span>
      </div>
    </motion.div>
  );
};
