import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Play, RotateCcw } from "lucide-react";

interface LearningModulesProps {
  userId: string;
}

export default function LearningModules({ userId }: LearningModulesProps) {
  const { data: modules = [] } = useQuery({
    queryKey: ["/api/learning-modules"],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user-progress", userId],
  });

  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress || { currentLesson: 0, isCompleted: false, xpEarned: 0 };
  };

  const currentModule = modules.find(module => {
    const progress = getModuleProgress(module.id);
    return !progress.isCompleted && progress.currentLesson > 0;
  });

  const completedModules = modules.filter(module => {
    const progress = getModuleProgress(module.id);
    return progress.isCompleted;
  });

  const lockedModules = modules.filter(module => {
    const progress = getModuleProgress(module.id);
    return !progress.isCompleted && progress.currentLesson === 0;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Learning Modules</CardTitle>
          <Link href="/learning">
            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
              View All
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Module */}
        {currentModule && (
          <div className="border-2 border-primary rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{currentModule.title}</h4>
              <Badge>In Progress</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">{currentModule.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  {(() => {
                    const progress = getModuleProgress(currentModule.id);
                    const totalLessons = Array.isArray(currentModule.lessons) ? currentModule.lessons.length : 1;
                    const progressPercentage = (progress.currentLesson / totalLessons) * 100;
                    return (
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      />
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-600">
                  {(() => {
                    const progress = getModuleProgress(currentModule.id);
                    const totalLessons = Array.isArray(currentModule.lessons) ? currentModule.lessons.length : 1;
                    return Math.round((progress.currentLesson / totalLessons) * 100);
                  })()}%
                </span>
              </div>
              <Button size="sm">
                <Play className="mr-1 h-3 w-3" />
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Module List */}
        <div className="space-y-3">
          {/* Completed Modules */}
          {completedModules.slice(0, 2).map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{module.title}</h5>
                  <p className="text-sm text-green-600">
                    Completed • +{module.xpReward} XP
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Locked Modules */}
          {lockedModules.slice(0, 2).map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg opacity-60"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{module.title}</h5>
                  <p className="text-sm text-gray-500">
                    Locked • Complete previous modules first
                  </p>
                </div>
              </div>
              <Badge variant="outline">+{module.xpReward} XP</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
