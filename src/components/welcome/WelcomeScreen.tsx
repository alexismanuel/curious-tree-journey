
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Lightbulb, Map } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-leaf-500" />,
      title: "Personalized Learning",
      description: "Custom learning paths tailored to your goals and knowledge level"
    },
    {
      icon: <Map className="h-6 w-6 text-blossom-500" />,
      title: "Visual Exploration",
      description: "Navigate knowledge visually through interactive concept trees"
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-sky-500" />,
      title: "AI Guidance",
      description: "Expert-level AI tutoring that adapts to your learning style"
    }
  ];

  return (
    <motion.div
      className="max-w-4xl w-full h-full mx-auto glassmorphic rounded-2xl p-4 sm:p-8 md:p-12 flex flex-col overflow-hidden"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-4 sm:mb-8">
        <motion.div 
          className="inline-block mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-blossom-500" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-bark-900">
          Learn Anything
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
          Visualize your learning journey as an interactive tree of knowledge
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8 px-2 sm:px-0">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="glassmorphic rounded-xl p-3 sm:p-6 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
          >
            <div className="mb-2 sm:mb-4 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm">
              {feature.icon}
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="flex justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Button 
          size="lg" 
          onClick={onGetStarted}
          className="bg-leaf-500 hover:bg-leaf-600 text-white font-medium px-6 sm:px-8 py-4 sm:py-6 rounded-full text-base sm:text-lg shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
        >
          Start Your Learning Journey
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
