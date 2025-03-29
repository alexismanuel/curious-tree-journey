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
      className={`relative flex flex-col p-4 bg-white border border-gray-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
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
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${statusStyles.textColor} text-base`}>
            {node.title}
          </span>
        </div>
        {node.description && (
          <p className="text-gray-500 text-sm line-clamp-2">
            {node.description}
          </p>
        )}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {node.tags.map((tag, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
