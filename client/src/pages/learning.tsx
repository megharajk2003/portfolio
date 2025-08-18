import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, Play } from "lucide-react";

const CURRENT_USER_ID = "user-1";

export default function Learning() {
  const { data: modules = [] } = useQuery({
    queryKey: ["/api/learning-modules"],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user-progress", CURRENT_USER_ID],
  });

  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress || { currentLesson: 0, isCompleted: false, xpEarned: 0 };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
            <p className="text-gray-600 mt-1">Master new skills and earn XP</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const progress = getModuleProgress(module.id);
            const totalLessons = Array.isArray(module.lessons) ? module.lessons.length : 0;
            const progressPercentage = totalLessons > 0 ? (progress.currentLesson / totalLessons) * 100 : 0;

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <Badge variant={progress.isCompleted ? "default" : "secondary"}>
                      {progress.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <BookOpen className="mr-1 h-4 w-4" />
                        {totalLessons} lessons
                      </span>
                      <span className="flex items-center">
                        <Trophy className="mr-1 h-4 w-4" />
                        {module.xpReward} XP
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <Button 
                      className="w-full" 
                      variant={progress.isCompleted ? "outline" : "default"}
                    >
                      {progress.isCompleted ? (
                        <>
                          <Trophy className="mr-2 h-4 w-4" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {progress.currentLesson === 0 ? "Start" : "Continue"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
