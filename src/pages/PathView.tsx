
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTreeStore } from "@/store/useTreeStore";
import MainTreeView from "@/components/tree/MainTreeView";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const PathView = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    learningGoal,
    treeData,
    isLoading,
    error,
    fetchPath
  } = useTreeStore();

  useEffect(() => {
    if (pathId) {
      fetchPath(pathId);
    }
  }, [pathId, fetchPath]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-leaf-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Path Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find the learning path you're looking for.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <MainTreeView learningGoal={learningGoal} />
    </div>
  );
};

export default PathView;
