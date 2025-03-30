import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Composant TreeGraph
 * Affiche une arborescence simple animée avec un nœud racine et trois enfants.
 */
const TreeGraph = () => {
  // Définit les positions pour les nœuds de l'arborescence
  const nodes = [
    { id: "root", cx: 150, cy: 20 },
    { id: "child1", cx: 80,  cy: 80 },
    { id: "child2", cx: 150, cy: 80 },
    { id: "child3", cx: 220, cy: 80 },
  ];

  // Définit les connexions entre le nœud racine et les enfants
  const connections = [
    { from: "root", to: "child1" },
    { from: "root", to: "child2" },
    { from: "root", to: "child3" },
  ];

  // Animation pour faire apparaître les nœuds avec une légère montée en opacité
  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 }
  };

  // Animation pour les lignes : effet "dessin" de la ligne
  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 }
  };

  return (
	  <div className="my-auto mx-4">
    <svg width="300" height="120" viewBox="0 0 300 120">
      {/* Rendu des connexions */}
      {connections.map((conn, index) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        return (
          <motion.line
            key={index}
            x1={fromNode.cx}
            y1={fromNode.cy}
            x2={toNode.cx}
            y2={toNode.cy}
            stroke="black"
            strokeWidth="2"
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.7 }}
          />
        );
      })}
      {/* Rendu des nœuds */}
      {nodes.map((node, index) => (
        <motion.circle
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          r="8"
          fill="black"
          variants={nodeVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease: "easeInOut", delay: 1 + index * 0.2 }}
        />
      ))}
    </svg>
	</div>
  );
};

/**
 * Composant de barre de chargement animée
 * @param {Object} props - Propriétés du composant
 * @param {number} [props.height=6] - Hauteur de la barre en pixels
 * @param {number} [props.width=300] - Largeur de la barre en pixels
 * @param {string} [props.message="Chargement en cours..."] - Message à afficher
 * @param {boolean} [props.pulseEffect=true] - Activer l'effet de pulsation sur le point
 * @returns {JSX.Element} Composant de barre de chargement et arborescence animée
 */
const LoadingBar = ({
  height = 6,
  width = 300,
  message = "Création de votre parcours...",
  pulseEffect = true
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulation d'une progression aléatoire pour simuler l'activité
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.max(0.5, (100 - prev) / 10);
        const newValue = Math.min(90, prev + increment);
        return newValue;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 ">
      <div className="mb-4 text-lg font-medium text-black">{message}</div>

      <div
        className="relative overflow-hidden rounded-full"
        style={{ width: `${width}px`, height: `${height}px`, backgroundColor: "#f0f0f0" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{ backgroundColor: "black" }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
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
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "black" }} />
        </motion.div>
      )}

      {/* Insertion du graphique arborescent animé */}
      <div className="mt-8">
        <TreeGraph />
      </div>
    </div>
  );
};

export default LoadingBar;
