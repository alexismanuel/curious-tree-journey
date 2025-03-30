import { useState } from "react";
import { motion } from "framer-motion";
import LearningPathCreation from "@/components/creation/LearningPathCreation";
import { PersonalizationForm } from "@/components/creation/PersonalizationForm";
import { PathView } from "@/components";
import { generateTreeFromCourseData } from "@/lib/tree-generator";
import { TreeData } from "@/types/tree";
import { ProgressDots } from "@/components/ui/progress-dots";
import { generatePlanningTree, sendCreateCourse, generateOnboarding } from "@/api/webhook";
import { saveToLocalStorage } from "@/utils/localStorage";
import LoadingBar from "@/components/ui/LoadingBar";
import { EditConversation } from "@/components/creation/EditConversation";

const Index = () => {
  const [stage, setStage] = useState<"creation" | "personalization" | "tree" | "loading" | "pathEdition">("creation");
  const [learningGoal, setLearningGoal] = useState<string>("");
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Génération de votre parcours d'apprentissage...");

  const handleCreatePath = async (goal: string) => {
    setLearningGoal(goal);
    const onboardData = await generateOnboarding(goal);
    setOnboardingData(onboardData);
    setStage("personalization");
  };

  const handlePersonalization = async (details: string) => {
    // Passer à l'étape de chargement
    setStage("loading");
    setLoadingMessage("Génération de votre parcours d'apprentissage personnalisé...");

    try {
      // Attendre la réponse de l'API
      const response = await generatePlanningTree(learningGoal, details);
      saveToLocalStorage("coursePlan", response);
      setLearningGoal(response.title)
      const courseData = await sendCreateCourse(response);
      saveToLocalStorage("courseData", courseData);
      console.log("Course Data:", courseData);
      // Generate a tree locally without persisting
      const initialTree = generateTreeFromCourseData(response);
      setTreeData(initialTree);

      // Show the tree visualization
      setStage("pathEdition");
    } catch (error) {
      console.error("Error creating course:", error);
      setLoadingMessage("Une erreur est survenue. Veuillez réessayer.");
      // Après un délai, revenir à l'étape de personnalisation
      setTimeout(() => {
        setStage("personalization");
      }, 3000);
    }
  };

  const handlePathEditionSubmit = async () => {
    setStage("tree");
  }

  const handlePathChanges = async (details: string) => {
    // TODO: Handle path changes
    console.log("Path changes:", details);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Minimal background */}
      <div className="inset-0 overflow-hidden">
        <div
          className="-translate-x-1/2 w-full h-full bg-muted rounded-full blur-3xl opacity-10 -z-10"
        />
      </div>

      {/* Progress dots */}
      {(stage === "creation" || stage === "personalization") && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-20">
          <ProgressDots
            totalSteps={2}
            currentStep={stage === "creation" ? 1 : 2}
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="flex-1 flex items-start sm:items-center justify-center px-4 relative z-10 pt-4 sm:pt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stage === "creation" && <LearningPathCreation onCreatePath={handleCreatePath} />}
        {stage === "personalization" && <PersonalizationForm goal={learningGoal} onboardMsg={onboardingData} onSubmit={handlePersonalization} />}
        {stage === "pathEdition" && treeData && <EditConversation treeData={treeData} onSubmit={handlePathChanges} onStart={handlePathEditionSubmit} />}
        {stage === "loading" && <LoadingBar message={loadingMessage} color="indigo" width={350} />}
        {stage === "tree" && <PathView learningGoal={learningGoal} treeData={treeData} />}
      </motion.div>
    </div>
  );
};

export default Index;
