import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, Calendar, BookOpen } from "lucide-react";
import { Goal } from "@shared/schema";

interface CompletedCoursesProps {
  userId: string;
}

export default function CompletedCourses({ userId }: CompletedCoursesProps) {
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Filter for completed goals (courses)
  const completedCourses = goals?.filter(
    (goal) => 
      goal.totalSubtopics && 
      goal.completedSubtopics && 
      goal.totalSubtopics > 0 && 
      goal.completedSubtopics === goal.totalSubtopics
  ) || [];

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="mr-3 h-6 w-6 text-emerald-600" />
            Completed Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading completed courses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl text-emerald-700 dark:text-emerald-300">
            <Trophy className="mr-3 h-6 w-6 text-emerald-600" />
            Completed Courses
          </CardTitle>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 px-3 py-1">
            {completedCourses.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {completedCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No completed courses yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Complete all lessons in a course to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {completedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                data-testid={`completed-course-${course.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {course.name}
                      </h4>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Completed {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                    </div>
                    <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {course.totalSubtopics || 0} lessons mastered
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Badge className="bg-emerald-500 text-white text-xs px-2 py-1">
                      100%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {completedCourses.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-600 mr-2" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Great job! You've completed {completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-1">
              Keep learning to unlock more achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}