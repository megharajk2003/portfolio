import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, Calendar, BookOpen } from "lucide-react";
import { Goal, Course, Enrollment } from "@shared/schema";
import React from "react";

interface CompletedCoursesProps {
  userId: string;
}

type CompletedCourse = Enrollment & {
  course: Course;
};

export default function CompletedCourses({ userId }: CompletedCoursesProps) {
  // Step 1: Fetch ALL user enrollments and rename the variable for clarity
  const { data: userEnrollments, isLoading: coursesLoading } = useQuery<
    CompletedCourse[]
  >({
    queryKey: ["/api/users", userId, "enrollments"],
    // It's good practice to wait for a valid userId
    enabled: !!userId,
  });

  // Fetch completed goals
  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Step 2: Create a NEW, correctly filtered array for completed courses
  // We use useMemo for efficiency, so this only recalculates when enrollments change.
  const completedCourses = React.useMemo(() => {
    // The course is complete if the 'completedAt' field has a value
    return (
      userEnrollments?.filter((enrollment) => !!enrollment.completedAt) || []
    );
  }, [userEnrollments]);

  // Filter for completed goals (Your existing logic here is already correct)
  const completedGoals =
    goals?.filter(
      (goal) =>
        goal.totalSubtopics &&
        goal.completedSubtopics &&
        goal.totalSubtopics > 0 &&
        goal.completedSubtopics === goal.totalSubtopics
    ) || [];

  const isLoading = coursesLoading || goalsLoading;

  // This calculation is now correct because it uses the filtered array
  const totalCompleted =
    (completedCourses?.length || 0) + completedGoals.length;

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
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 px-3 py-1"
          >
            {totalCompleted} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {totalCompleted === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No completed courses yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Complete all lessons in a course to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {/* Completed Courses */}
            {/* Completed Courses */}
            {completedCourses?.map((enrollment) => (
              <div
                key={`course-${enrollment.id}`} // Use enrollment ID for the key
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                data-testid={`completed-course-${enrollment.courseId}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {/* 👇 FIX: Access the title from the nested course object */}
                        {enrollment.course.title}
                      </h4>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Completed{" "}
                      {/* 👇 FIX: Use the correct property 'completedAt' */}
                      {enrollment.completedAt
                        ? new Date(enrollment.completedAt).toLocaleDateString()
                        : "Recently"}
                    </div>
                    {/* Note: 'totalLessons' is not in the API response, so this will show 0.
            You can add this to your backend query later if needed. */}
                    <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {enrollment.course.totalLessons || 0} lessons mastered
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

            {/* Completed Goals */}
            {completedGoals.map((goal) => (
              <div
                key={`goal-${goal.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                data-testid={`completed-goal-${goal.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {goal.name}
                      </h4>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Completed{" "}
                      {goal.updatedAt
                        ? new Date(goal.updatedAt).toLocaleDateString()
                        : "Recently"}
                    </div>
                    <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {goal.totalSubtopics || 0} lessons mastered
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

        {totalCompleted > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-600 mr-2" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Great job! You've completed {totalCompleted} course
                {totalCompleted !== 1 ? "s" : ""}
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
