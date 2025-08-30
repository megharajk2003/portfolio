import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, Lock, Play, RotateCcw } from "lucide-react";
import {
  LearningModule,
  UserProgress,
  Course,
  Enrollment,
} from "../../../shared/schema";
import React from "react";

interface LearningModulesProps {
  userId: string;
}

// A new, reusable component for displaying each module in the list
const ModuleItem = ({
  module,
  status,
}: {
  module: LearningModule;
  status: "completed" | "available" | "locked";
}) => {
  const icons = {
    completed: (
      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
    ),
    available: (
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
        <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    ),
    locked: (
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
        <Lock className="h-5 w-5 text-slate-400" />
      </div>
    ),
  };

  const content = {
    completed: (
      <p className="text-sm text-emerald-600 dark:text-emerald-400">
        Completed • +{module.xpReward} XP
      </p>
    ),
    available: (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Click to start learning
      </p>
    ),
    locked: (
      <p className="text-sm text-slate-400 dark:text-slate-500">
        Complete previous modules to unlock
      </p>
    ),
  };

  const action = {
    completed: (
      <Button size="sm" variant="ghost">
        <RotateCcw className="mr-1 h-3 w-3" /> Review
      </Button>
    ),
    available: (
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
        <Play className="mr-1 h-3 w-3" /> Start
      </Button>
    ),
    locked: (
      <Badge
        variant="outline"
        className="text-slate-400 border-slate-300 dark:border-slate-600"
      >
        +{module.xpReward} XP
      </Badge>
    ),
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    status === "available" ? (
      <Link href={`/module/${module.id}`}>{children}</Link>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition-all
          ${
            status === "available"
              ? "hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
              : ""
          }
          ${status === "locked" ? "opacity-60" : ""}
        `}
      >
        <div className="flex items-center space-x-3">
          {icons[status]}
          <div>
            <h5 className="font-medium text-slate-900 dark:text-white">
              {module.title}
            </h5>
            {content[status]}
          </div>
        </div>
        {action[status]}
      </div>
    </Wrapper>
  );
};

export default function LearningModules({ userId }: LearningModulesProps) {
  const { data: modules = [] } = useQuery<LearningModule[]>({
    queryKey: ["/api/learning-modules"],
  });
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/user-progress", userId],
  });
  const { data: userEnrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/users", userId, "enrollments"],
  });
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Memoize progress lookup for performance
  const moduleProgressMap = React.useMemo(
    () => new Map(userProgress.map((p) => [p.moduleId, p])),
    [userProgress]
  );

  const getModuleProgress = (moduleId: string) => {
    return (
      moduleProgressMap.get(moduleId) || {
        currentLesson: 0,
        isCompleted: false,
        xpEarned: 0,
      }
    );
  };

  // Helper function to determine the status of a module
  const getModuleStatus = (
    module: LearningModule,
    index: number
  ): "completed" | "available" | "locked" => {
    const progress = getModuleProgress(module.id);
    if (progress.isCompleted) {
      return "completed";
    }

    // Check if all previous modules are completed
    for (let i = 0; i < index; i++) {
      if (!getModuleProgress(modules[i].id).isCompleted) {
        return "locked";
      }
    }
    return "available";
  };

  const enrolledCourses = courses.filter((course: Course) => {
    const enrollment = userEnrollments.find(
      (e: Enrollment) => e.courseId === course.id
    );
    return enrollment && !enrollment.completedAt;
  });

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl text-blue-700 dark:text-blue-300">
            <BookOpen className="mr-3 h-6 w-6 text-blue-600" />
            Learning Modules
          </CardTitle>
          <Link href="/learning">
            <Button
              variant="ghost"
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Enrolled Courses */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-900 mb-3 dark:text-white px-1">
            My Enrolled Courses
          </h4>
          {enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.slice(0, 3).map((course: Course) => (
                <Link key={course.id} href={`/course/${course.id}/learn`}>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {course.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Course Provider
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                      >
                        <Play className="mr-1 h-3 w-3" /> Resume
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-2 font-medium">
                No active courses
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Enroll in a course to start your journey.
              </p>
              <Link href="/learning">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
