
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

const ProgressIndicator = ({ completed, total }: ProgressIndicatorProps) => {
  const percentage = Math.round((completed / total) * 100) || 0;
  
  return (
    <motion.div 
      className="inline-flex items-center bg-white/50 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-white/60"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="relative w-6 h-6 rounded-full bg-leaf-500 mr-2 flex items-center justify-center overflow-hidden"
      >
        <Sparkles className="h-3.5 w-3.5 text-white" />
        {percentage === 100 && (
          <motion.div
            className="absolute inset-0 bg-yellow-400"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="h-full w-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </motion.div>
          </motion.div>
        )}
      </div>
      <div>
        <div className="text-xs font-medium">
          Learning Progress
        </div>
        <div className="flex items-center">
          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden mr-2">
            <motion.div 
              className="h-full bg-leaf-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs font-medium">
            {percentage}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressIndicator;
