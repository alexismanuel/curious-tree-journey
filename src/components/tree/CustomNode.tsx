import { motion } from "framer-motion";
import { Node } from "@/types/tree";

export const CustomNode = ({ data }: { data: { node: Node, isSelected: boolean, onSelect: (node: Node) => void, style: { width: number, height: number, scale: number, primaryColor: string }, index: number } }) => {
  const { node, isSelected, onSelect, index } = data;
  const isEven = index % 2 === 0;
  
  return (
    <div 
      className="relative group"
      onClick={() => onSelect(node)}
    >
      {/* Title */}
      <div 
        className={`absolute ${isEven ? 'right-full mr-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 text-sm font-medium whitespace-nowrap`}
      >
        {node.title}
      </div>

      {/* Circle */}
      <motion.div
        className={`w-12 h-12 rounded-full transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}
        style={{
          background: '#F0F0F0',
          border: '2px solid #000000',
        }}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
      />
    </div>
  );
};
