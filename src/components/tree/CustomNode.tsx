import { motion } from "framer-motion";
import { Node } from "@/types/tree";
import { Handle, Position } from "@xyflow/react";
import { Check, Lock } from "lucide-react";

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
        className={`absolute ${isEven ? 'right-full mr-4' : 'left-full ml-4'} top-1/2 -translate-y-1/2 text-sm font-medium`}
        style={{
          fontSize: '14px',
          width: '140px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          flexDirection: isEven ? 'row-reverse' : 'row',
          textAlign: isEven ? 'right' : 'left'
        }}
      >
        {node.title}
      </div>

      {/* Circle */}
      <motion.div
        className={`w-12 h-12 rounded-full transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''} relative flex items-center justify-center`}
        style={{
          background: node.status === 'locked' ? 'white' : '#372EC1',
          border: '2px solid #372EC1',
        }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
      >
        <Handle
          id="top"
          type="target"
          position={Position.Top}
          style={{ opacity: 0 }}
        />
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0 }}
        />
        {node.status === 'completed' && (
          <Check className="h-6 w-6 text-white" />
        )}
        {node.status === 'locked' && (
          <Lock className="h-6 w-6 text-[#372EC1]" />
        )}
      </motion.div>
    </div>
  );
};
