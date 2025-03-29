import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Composant de barre de chargement animée
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.color="blue"] - Couleur principale de la barre
 * @param {number} [props.height=6] - Hauteur de la barre en pixels
 * @param {number} [props.width=300] - Largeur de la barre en pixels
 * @param {string} [props.message="Chargement en cours..."] - Message à afficher
 * @param {boolean} [props.pulseEffect=true] - Activer l'effet de pulsation
 * @returns {JSX.Element} Composant de barre de chargement
 */
const LoadingBar = ({ 
  color = "blue", 
  height = 6, 
  width = 300, 
  message = "Chargement en cours...",
  pulseEffect = true
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulation de progression aléatoire pour donner l'impression d'activité
    // Cette progression n'est pas liée à l'avancement réel de la requête
    const interval = setInterval(() => {
      setProgress(prev => {
        // Avance plus lentement à mesure qu'on s'approche de 90%
        const increment = Math.max(0.5, (100 - prev) / 20);
        const newValue = Math.min(90, prev + increment);
        return newValue;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);
  
  const getColorClass = () => {
    switch(color) {
      case "blue": return "bg-blue-500";
      case "green": return "bg-green-500";
      case "purple": return "bg-purple-500";
      case "indigo": return "bg-indigo-500";
      default: return "bg-blue-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-background shadow-lg">
      <div className="mb-4 text-lg font-medium text-foreground">{message}</div>
      
      <div 
        className="relative overflow-hidden bg-gray-200 rounded-full w-full"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <motion.div
          className={`absolute top-0 left-0 h-full ${getColorClass()}`}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>
      
      {pulseEffect && (
        <motion.div
          className="mt-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut" 
          }}
        >
          <div className={`w-3 h-3 rounded-full ${getColorClass()}`} />
        </motion.div>
      )}
    </div>
  );
};

export default LoadingBar;