import { motion } from "framer-motion";
import { Check, Lock, ChevronRight } from "lucide-react";
import { Node } from "@/types/tree";

export const CustomNode = ({ data }: { data: { node: Node, isSelected: boolean, onSelect: (node: Node) => void, style: { width: number, height: number, scale: number, primaryColor: string } } }) => {
  const { node, isSelected, onSelect } = data;
  const { style } = data;
  
  // Define status-based styles
  const getStatusStyles = () => {
    const baseStyles = {
      textColor: 'text-gray-700'
    };
    
    if (node.status === "completed") {
      return {
        textColor: 'text-gray-700'
      };
    } else if (node.status === "active") {
      return {
        textColor: 'text-gray-700'
      };
    } else if (node.status === "locked") {
      return {
        textColor: 'text-gray-500'
      };
    }
    
    return baseStyles;
  };
  
  const statusStyles = getStatusStyles();
  
  return (
    <motion.div
      className={`relative flex flex-col p-3 sm:p-4 bg-white border border-gray-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        width: `${style.width}px`,
        height: `${style.height}px`,
        transform: `scale(${style.scale})`,
        transformOrigin: 'center center'
      }}
      onClick={() => onSelect(node)}
      whileHover={{ 
        scale: style.scale * 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: style.scale * 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <div className="flex items-center justify-center w-full h-full">
        <span className={`font-semibold ${statusStyles.textColor} text-sm sm:text-base text-center`}>
          {node.title}
        </span>
      </div>
    </motion.div>
  );
};
