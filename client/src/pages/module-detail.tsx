import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Lock,
  CheckCircle,
  PlayCircle,
  Trophy,
  Star,
  BookOpen,
  Clock,
  Award,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  title: string;
  content: string;
  xp: number;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  lessons: Lesson[];
  isActive: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LessonProgress {
  lessonIndex: number;
  isCompleted: boolean;
  quizPassed: boolean;
  quizScore?: number | null;
  quizAttempts: number;
}

interface ModuleProgress {
  currentLesson: number;
  isCompleted: boolean;
  finalExamPassed: boolean;
  finalExamScore?: number | null;
  finalExamAttempts: number;
  xpEarned: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  lessonIndex: number;
}

export default function ModuleDetail() {
  const [, params] = useRoute("/module/:id");
  const moduleId = params?.id;
  const [currentUser] = useState({ id: 1 }); // Mock user - replace with actual auth
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFinalExam, setShowFinalExam] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch module details
  const { data: module, isLoading: moduleLoading } = useQuery<LearningModule>({
    queryKey: ["/api/learning-modules", moduleId],
    enabled: !!moduleId,
  });

  // Fetch user progress for this module
  const { data: moduleProgress, isLoading: progressLoading } = useQuery<ModuleProgress>({
    queryKey: ["/api/user-progress", currentUser.id, moduleId],
    enabled: !!moduleId,
  });

  // Fetch individual lesson progress
  const { data: lessonProgressList = [] } = useQuery<LessonProgress[]>({
    queryKey: ["/api/lesson-progress", currentUser.id, moduleId],
    enabled: !!moduleId,
  });

  // Check if user is enrolled (has any progress or lesson progress)
  useEffect(() => {
    if (moduleProgress || lessonProgressList.length > 0) {
      setIsEnrolled(true);
    }
  }, [moduleProgress, lessonProgressList]);

  // Enroll in module mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/user-progress`, "POST", {
        userId: currentUser.id,
        moduleId,
        currentLesson: 0,
        isCompleted: false,
        xpEarned: 0,
      });
    },
    onSuccess: () => {
      setIsEnrolled(true);
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      toast({
        title: "Enrolled Successfully!",
        description: "You can now start learning. Good luck!",
      });
    },
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonIndex: number) => {
      return apiRequest(`/api/lesson-progress/complete`, "POST", {
        userId: currentUser.id,
        moduleId,
        lessonIndex,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      toast({
        title: "Lesson Completed!",
        description: "Great job! You can now proceed to the quiz.",
      });
    },
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async ({
      lessonIndex,
      answers,
      isFinalExam = false,
    }: {
      lessonIndex: number;
      answers: number[];
      isFinalExam?: boolean;
    }): Promise<QuizResult> => {
      const response = await apiRequest(`/api/quiz/submit`, "POST", {
        userId: currentUser.id,
        moduleId,
        lessonIndex: isFinalExam ? -1 : lessonIndex,
        answers,
      });
      return response.json();
    },
    onSuccess: (result: QuizResult) => {
      setQuizResults(result);
      queryClient.invalidateQueries({ queryKey: ["/api/lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      
      if (result.passed) {
        toast({
          title: result.lessonIndex === -1 ? "Final Exam Passed!" : "Quiz Passed!",
          description: `Congratulations! You scored ${result.score}/${result.totalQuestions}`,
        });
      } else {
        toast({
          title: "Try Again",
          description: `You scored ${result.score}/${result.totalQuestions}. Keep learning!`,
          variant: "destructive",
        });
      }
    },
  });

  // Fetch quiz questions
  const { data: quizQuestions = [] } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quiz-questions", moduleId, selectedLesson],
    enabled: !!moduleId && (showQuiz || showFinalExam) && selectedLesson !== null,
  });

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  const handleLessonComplete = (lessonIndex: number) => {
    completeLessonMutation.mutate(lessonIndex);
  };

  const handleQuizSubmit = () => {
    const answers = Object.keys(quizAnswers)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => quizAnswers[key]);
    
    if (answers.length !== quizQuestions.length) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitQuizMutation.mutate({
      lessonIndex: selectedLesson!,
      answers,
      isFinalExam: showFinalExam,
    });
  };

  const getLessonProgress = (lessonIndex: number): LessonProgress | null => {
    return lessonProgressList.find((lp) => lp.lessonIndex === lessonIndex) || null;
  };

  const isLessonUnlocked = (lessonIndex: number): boolean => {
    // First lesson is always unlocked if user is enrolled
    if (lessonIndex === 0) return isEnrolled;
    
    // Subsequent lessons unlock when the previous lesson is completed
    const previousLessonProgress = getLessonProgress(lessonIndex - 1);
    return !!(previousLessonProgress?.isCompleted);
  };

  const canTakeFinalExam = (): boolean => {
    if (!module?.lessons || !Array.isArray(module.lessons)) return false;
    
    return module.lessons.every((_, index) => {
      const progress = getLessonProgress(index);
      return !!(progress?.isCompleted);
    });
  };

  const calculateProgress = (): number => {
    if (!module?.lessons || !Array.isArray(module.lessons)) return 0;
    
    const completedLessons = module.lessons.filter((_, index) => {
      const progress = getLessonProgress(index);
      return !!(progress?.isCompleted);
    }).length;
    
    return (completedLessons / module.lessons.length) * 100;
  };

  if (moduleLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
          <Link href="/learning">
            <Button>Back to Learning</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lessons = Array.isArray(module.lessons) ? module.lessons : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/learning">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>
          </Link>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2" data-testid="text-module-title">
                    {module.title}
                  </CardTitle>
                  <CardDescription data-testid="text-module-description">
                    {module.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary" data-testid="badge-category">
                      {module.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium" data-testid="text-xp-reward">
                        {module.xpReward} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm" data-testid="text-lesson-count">
                        {lessons.length} Lessons
                      </span>
                    </div>
                  </div>
                </div>
                {moduleProgress?.isCompleted && (
                  <Trophy className="h-8 w-8 text-yellow-500" data-testid="icon-completed" />
                )}
              </div>
              
              {isEnrolled && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground" data-testid="text-progress-percentage">
                      {Math.round(calculateProgress())}%
                    </span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" data-testid="progress-module" />
                </div>
              )}
              
              {!isEnrolled && (
                <div className="mt-6">
                  <Button 
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    className="w-full"
                    size="lg"
                    data-testid="button-enroll"
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll for Free"}
                  </Button>
                </div>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Start Learning Button for enrolled users */}
        {isEnrolled && !moduleProgress?.isCompleted && (
          <div className="mb-6">
            <Button 
              onClick={() => {
                const firstUnlockedLesson = lessons.findIndex((_, index) => isLessonUnlocked(index));
                if (firstUnlockedLesson !== -1) {
                  document.getElementById(`lesson-${firstUnlockedLesson}`)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full"
              size="lg"
              data-testid="button-start-learning"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Start Learning
            </Button>
          </div>
        )}

        {/* Lessons */}
        {isEnrolled && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Lessons</h2>
          {lessons.map((lesson: Lesson, index: number) => {
            const lessonProgress = getLessonProgress(index);
            const isUnlocked = isLessonUnlocked(index);
            const isCompleted = lessonProgress?.isCompleted;

            return (
              <Card key={index} id={`lesson-${index}`} className={`transition-all ${!isUnlocked ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" data-testid={`icon-completed-${index}`} />
                      ) : !isUnlocked ? (
                        <Lock className="h-5 w-5 text-gray-400" data-testid={`icon-locked-${index}`} />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-primary" data-testid={`icon-play-${index}`} />
                      )}
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-lesson-title-${index}`}>
                          {lesson.title}
                        </CardTitle>
                        <CardDescription data-testid={`text-lesson-content-${index}`}>
                          {lesson.content}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-xp-${index}`}>
                        {lesson.xp} XP
                      </Badge>
                      {isUnlocked && !isCompleted && (
                        <div className="flex gap-2">
                          {!lessonProgress?.isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => handleLessonComplete(index)}
                              disabled={completeLessonMutation.isPending}
                              data-testid={`button-complete-lesson-${index}`}
                            >
                              Mark Complete
                            </Button>
                          )}
                          {lessonProgress?.isCompleted && !lessonProgress?.quizPassed && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedLesson(index);
                                setShowQuiz(true);
                                setQuizAnswers({});
                                setQuizResults(null);
                              }}
                              data-testid={`button-take-quiz-${index}`}
                            >
                              Take Quiz
                            </Button>
                          )}
                        </div>
                      )}
                      {lessonProgress && lessonProgress.quizAttempts > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {lessonProgress.quizAttempts} attempt{lessonProgress.quizAttempts > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
          </div>
        )}

        {/* Final Exam */}
        {isEnrolled && (
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Final Exam
            </CardTitle>
            <CardDescription>
              Complete all lessons to unlock the final exam and earn your certificate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                {moduleProgress?.finalExamPassed ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      Passed with {moduleProgress.finalExamScore}/10
                    </span>
                  </div>
                ) : canTakeFinalExam() ? (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Ready to take final exam</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <span className="text-muted-foreground">Complete all lessons first</span>
                  </div>
                )}
              </div>
              {canTakeFinalExam() && !moduleProgress?.finalExamPassed && (
                <Button
                  onClick={() => {
                    setSelectedLesson(-1);
                    setShowFinalExam(true);
                    setQuizAnswers({});
                    setQuizResults(null);
                  }}
                  data-testid="button-final-exam"
                >
                  Take Final Exam
                </Button>
              )}
              {moduleProgress && moduleProgress.finalExamAttempts > 0 && (
                <span className="text-xs text-muted-foreground">
                  {moduleProgress.finalExamAttempts} attempt{moduleProgress.finalExamAttempts > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Quiz Dialog */}
        <Dialog open={showQuiz || showFinalExam} onOpenChange={(open) => {
          if (!open) {
            setShowQuiz(false);
            setShowFinalExam(false);
            setSelectedLesson(null);
            setQuizAnswers({});
            setQuizResults(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {showFinalExam ? "Final Exam" : `Lesson ${(selectedLesson || 0) + 1} Quiz`}
              </DialogTitle>
              <DialogDescription>
                {showFinalExam 
                  ? "Answer all questions correctly to complete the module and earn your certificate."
                  : "Answer all questions correctly to unlock the next lesson."
                }
              </DialogDescription>
            </DialogHeader>

            {quizResults ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${quizResults.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                  <div className="flex items-center gap-2 mb-2">
                    {quizResults.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-red-500" />
                    )}
                    <span className="font-semibold">
                      {quizResults.passed ? 'Congratulations!' : 'Keep Learning!'}
                    </span>
                  </div>
                  <p>
                    You scored {quizResults.score} out of {quizResults.totalQuestions} questions correctly.
                  </p>
                  {!quizResults.passed && (
                    <p className="text-sm mt-2">
                      You need at least 70% to pass. Review the lesson content and try again.
                    </p>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowQuiz(false);
                      setShowFinalExam(false);
                      setSelectedLesson(null);
                      setQuizAnswers({});
                      setQuizResults(null);
                    }}
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {quizQuestions.map((question, qIndex: number) => (
                  <div key={question.id} className="space-y-3">
                    <h4 className="font-medium">
                      {qIndex + 1}. {question.question}
                    </h4>
                    <RadioGroup
                      value={quizAnswers[qIndex]?.toString()}
                      onValueChange={(value) =>
                        setQuizAnswers((prev) => ({
                          ...prev,
                          [qIndex]: parseInt(value),
                        }))
                      }
                    >
                      {question.options.map((option, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={oIndex.toString()}
                            id={`q${qIndex}-o${oIndex}`}
                          />
                          <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                
                <DialogFooter>
                  <Button
                    onClick={handleQuizSubmit}
                    disabled={submitQuizMutation.isPending}
                    data-testid="button-submit-quiz"
                  >
                    {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}