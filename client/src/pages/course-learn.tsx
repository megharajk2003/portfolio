import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  BookOpen, Play, Clock, ChevronLeft, ChevronRight, 
  CheckCircle, Circle, ArrowLeft, Lock, Unlock
} from "lucide-react";

// API request helper
const apiRequest = async (url: string, method = "GET", body?: any) => {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export default function CourseLearn() {
  const { courseId } = useParams();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch course data
  const { data: course } = useQuery<any>({
    queryKey: ["/api/courses", courseId],
  });

  // Fetch course modules
  const { data: modules = [] } = useQuery<any[]>({
    queryKey: ["/api/courses", courseId, "modules"],
  });

  // Fetch lessons for selected module
  const { data: lessons = [] } = useQuery<any[]>({
    queryKey: ["/api/modules", selectedModuleId, "lessons"],
    enabled: !!selectedModuleId,
  });

  // Fetch lesson progress for current user and module
  const { data: lessonProgress = [] } = useQuery<any[]>({
    queryKey: ["/api/lesson-progress", user?.id, selectedModuleId],
    enabled: !!user && !!selectedModuleId,
  });

  // Auto-select first module and lesson
  React.useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  React.useEffect(() => {
    if (lessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  // Helper functions for lesson progress and locking
  const getLessonProgress = (lessonIndex: number) => {
    return lessonProgress.find((p: any) => p.lessonIndex === lessonIndex);
  };

  const isLessonUnlocked = (lessonIndex: number) => {
    // First lesson is always unlocked
    if (lessonIndex === 0) return true;
    
    // Other lessons unlock when previous lesson is completed
    const previousProgress = getLessonProgress(lessonIndex - 1);
    return previousProgress?.isCompleted || false;
  };

  const isLessonCompleted = (lessonIndex: number) => {
    const progress = getLessonProgress(lessonIndex);
    return progress?.isCompleted || false;
  };

  const selectedLesson = lessons.find((lesson: any) => lesson.id === selectedLessonId);
  const currentLessonIndex = lessons.findIndex((lesson: any) => lesson.id === selectedLessonId);

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      if (isLessonUnlocked(nextIndex)) {
        setSelectedLessonId(lessons[nextIndex].id);
      }
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setSelectedLessonId(lessons[currentLessonIndex - 1].id);
    }
  };

  // Lesson completion mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonIndex: number) => {
      return apiRequest(`/api/lesson-progress/complete`, "POST", {
        userId: user?.id,
        moduleId: selectedModuleId,
        lessonIndex,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lesson-progress"] });
      toast({
        title: "Lesson Completed!",
        description: "Great job! You've unlocked the next lesson.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!course) {
    return <div className="p-6">Loading course...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/learning">
            <Button variant="ghost" className="mb-4" data-testid="button-back-to-courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {course.subtitle}
            </p>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{course.level}</Badge>
              <Badge variant="outline">{course.language}</Badge>
              <span className="text-sm text-gray-500">
                {course.durationMonths} months • {modules.length} modules
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Structure */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module: any, moduleIndex: number) => (
                  <div key={module.id} className="space-y-2">
                    <Button
                      variant={selectedModuleId === module.id ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedModuleId(module.id)}
                      data-testid={`module-${module.id}`}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          Module {moduleIndex + 1}: {module.title}
                        </div>
                        <div className="text-xs opacity-60">
                          {module.durationHours} hours
                        </div>
                      </div>
                    </Button>
                    
                    {selectedModuleId === module.id && (
                      <div className="ml-4 space-y-1">
                        {lessons.map((lesson: any, lessonIndex: number) => {
                          const unlocked = isLessonUnlocked(lessonIndex);
                          const completed = isLessonCompleted(lessonIndex);
                          const isSelected = selectedLessonId === lesson.id;
                          
                          return (
                            <Button
                              key={lesson.id}
                              variant={isSelected ? "secondary" : "ghost"}
                              size="sm"
                              className={`w-full justify-start text-xs h-auto py-2 px-3 ${
                                !unlocked ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              onClick={() => unlocked && setSelectedLessonId(lesson.id)}
                              disabled={!unlocked}
                              data-testid={`lesson-${lesson.id}`}
                            >
                              <div className="flex items-center w-full">
                                <div className="flex items-center mr-2 min-w-fit">
                                  {completed ? (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  ) : unlocked ? (
                                    <Unlock className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <Lock className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="truncate">
                                    {lessonIndex + 1}. {lesson.title}
                                  </div>
                                  {lesson.durationMinutes && (
                                    <div className="text-xs opacity-60 mt-1">
                                      {lesson.durationMinutes} min
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Lesson */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedLesson.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Lesson {currentLessonIndex + 1} of {lessons.length}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {selectedLesson.durationMinutes} min
                    </Badge>
                  </div>
                  <Progress 
                    value={lessonProgress.filter((p: any) => p.isCompleted).length / lessons.length * 100} 
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Progress: {lessonProgress.filter((p: any) => p.isCompleted).length} of {lessons.length} lessons completed</span>
                    {isLessonCompleted(currentLessonIndex) && (
                      <Badge variant="secondary" className="text-green-700">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Player */}
                  {selectedLesson.videoUrl && (
                    <div className="aspect-video">
                      <iframe
                        src={selectedLesson.videoUrl.replace('watch?v=', 'embed/')}
                        title={selectedLesson.title}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-testid="lesson-video"
                      />
                    </div>
                  )}

                  {/* Lesson Content */}
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Lesson Content</h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedLesson.content}
                      </p>
                    </div>
                  </div>

                  {/* Lesson Completion */}
                  {!isLessonCompleted(currentLessonIndex) && (
                    <div className="flex justify-center pt-6 border-t">
                      <Button
                        onClick={() => completeLessonMutation.mutate(currentLessonIndex)}
                        disabled={completeLessonMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-complete-lesson"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {completeLessonMutation.isPending ? "Marking Complete..." : "Mark as Complete"}
                      </Button>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousLesson}
                      disabled={currentLessonIndex === 0}
                      data-testid="button-previous-lesson"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-500">
                      {currentLessonIndex + 1} of {lessons.length} lessons
                    </span>
                    
                    <Button
                      onClick={goToNextLesson}
                      disabled={
                        currentLessonIndex === lessons.length - 1 || 
                        !isLessonUnlocked(currentLessonIndex + 1)
                      }
                      data-testid="button-next-lesson"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a Module to Start Learning
                  </h3>
                  <p className="text-gray-500">
                    Choose a module from the sidebar to begin your learning journey.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}