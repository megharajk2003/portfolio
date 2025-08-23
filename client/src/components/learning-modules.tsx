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

  // Get user enrollments for courses
  const { data: userEnrollments = [] } = useQuery({
    queryKey: ["/api/users", userId, "enrollments"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress || { currentLesson: 0, isCompleted: false, xpEarned: 0 };
  };

  // Function to check if a module should be unlocked based on sequential completion
  const isModuleUnlocked = (moduleIndex: number) => {
    // First module is always unlocked
    if (moduleIndex === 0) return true;
    
    // Check if all previous modules are completed
    for (let i = 0; i < moduleIndex; i++) {
      const previousModule = modules[i];
      const previousProgress = getModuleProgress(previousModule.id);
      if (!previousProgress.isCompleted) {
        return false;
      }
    }
    return true;
  };

  const currentModule = modules.find((module, index) => {
    const progress = getModuleProgress(module.id);
    return !progress.isCompleted && progress.currentLesson > 0 && isModuleUnlocked(index);
  });

  const completedModules = modules.filter(module => {
    const progress = getModuleProgress(module.id);
    return progress.isCompleted;
  });

  const availableModules = modules.filter((module, index) => {
    const progress = getModuleProgress(module.id);
    return !progress.isCompleted && progress.currentLesson === 0 && isModuleUnlocked(index);
  });

  const lockedModules = modules.filter((module, index) => {
    const progress = getModuleProgress(module.id);
    return !progress.isCompleted && !isModuleUnlocked(index);
  });

  // Get enrolled courses
  const enrolledCourses = courses.filter(course => 
    userEnrollments.some(enrollment => enrollment.courseId === course.id)
  );

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
        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">My Enrolled Courses</h4>
            <div className="space-y-3">
              {enrolledCourses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Play className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{course.title}</h5>
                      <p className="text-sm text-gray-500">
                        {course.provider || 'Course Provider'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/course/${course.id}/learn`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="mr-1 h-3 w-3" />
                      Resume
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            {enrolledCourses.length > 3 && (
              <div className="mt-3 text-center">
                <Link href="/learning">
                  <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                    View all {enrolledCourses.length} enrolled courses
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}

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
              <Link href={`/module/${currentModule.id}`}>
                <Button size="sm">
                  <Play className="mr-1 h-3 w-3" />
                  Continue
                </Button>
              </Link>
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

          {/* Available Modules */}
          {availableModules.slice(0, 2).map((module) => (
            <Link key={module.id} href={`/module/${module.id}`}>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{module.title}</h5>
                    <p className="text-sm text-gray-500">
                      Click to start learning
                    </p>
                  </div>
                </div>
                <Badge variant="outline">+{module.xpReward} XP</Badge>
              </div>
            </Link>
          ))}

          {/* Locked Modules */}
          {lockedModules.slice(0, 2).map((module) => (
            <div key={module.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-600">{module.title}</h5>
                  <p className="text-sm text-gray-400">
                    Complete previous modules to unlock
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-gray-400 border-gray-300">
                +{module.xpReward} XP
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
