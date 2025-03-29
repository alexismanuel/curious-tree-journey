
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
      className="max-w-4xl w-full mx-auto glassmorphic rounded-2xl p-8 md:p-12"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <motion.div 
          className="inline-block mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <Sparkles className="h-12 w-12 text-blossom-500" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-bark-900">
          Learn Anything
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Visualize your learning journey as an interactive tree of knowledge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="glassmorphic rounded-xl p-6 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
          >
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
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
          className="bg-leaf-500 hover:bg-leaf-600 text-white font-medium px-8 py-6 rounded-full text-lg shadow-md hover:shadow-lg transition-all"
        >
          Start Your Learning Journey
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
