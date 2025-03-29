
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchUserPaths, LearningPath, deletePath } from "@/api/paths";
import { Plus, Trash2, LogOut, ChevronRight, User } from "lucide-react";
import LearningPathCreation from "@/components/creation/LearningPathCreation";

const Dashboard = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      setIsLoading(true);
      const userPaths = await fetchUserPaths();
      setPaths(userPaths);
    } catch (error) {
      toast({
        title: "Error loading paths",
        description: "There was a problem loading your learning paths.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePath = (goal: string) => {
    setIsCreating(false);
    navigate("/", { state: { learningGoal: goal } });
  };

  const handleDeletePath = async (id: string) => {
    try {
      await deletePath(id);
      setPaths(paths.filter(path => path.id !== id));
      toast({
        title: "Path deleted",
        description: "Your learning path has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the learning path.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 to-leaf-50">
      <header className="py-4 px-6 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-bark-900">Learn Anything</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {user?.email}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-bark-900">Your Learning Paths</h2>
            <p className="text-muted-foreground mt-1">
              Continue your learning journey or start a new one
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Learning Path
          </Button>
        </div>

        {isCreating ? (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Create New Learning Path</CardTitle>
                <CardDescription>
                  Define what you want to learn, and we'll create a personalized path for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningPathCreation onCreatePath={handleCreatePath} />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))
          ) : paths.length > 0 ? (
            paths.map((path) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="line-clamp-1">{path.goal}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePath(path.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <CardDescription>
                      Created {new Date(path.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {path.tree_data.nodes.filter(n => n.status === "completed").length} of{" "}
                      {path.tree_data.nodes.length} nodes completed
                    </p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-leaf-500 rounded-full"
                        style={{
                          width: `${(path.tree_data.nodes.filter(n => n.status === "completed").length / path.tree_data.nodes.length) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/path/${path.id}`)}
                    >
                      Continue Learning
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have any learning paths yet.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Path
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
