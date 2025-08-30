import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCalendarProps {
  userId: string;
}

// Define the number of days to show in the calendar
const TOTAL_DAYS = 365;

export default function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const { data: dailyActivity = [] } = useQuery<
    { date: string; xpEarned: number; lessonsCompleted: number; intensity: number }[]
  >({
    queryKey: ["/api/daily-activity", userId],
  });

  // Calculate intensity based on lessons completed: 0, 1-2, 3-4, >4
  const calculateIntensity = (lessonsCompleted: number) => {
    if (lessonsCompleted === 0) return 0;
    if (lessonsCompleted >= 1 && lessonsCompleted <= 2) return 1;
    if (lessonsCompleted >= 3 && lessonsCompleted <= 4) return 2;
    return 3; // >4 lessons
  };

  // Use real activity data with calculated intensity based on lessons
  const activityData = dailyActivity.map(day => ({
    ...day,
    intensity: calculateIntensity(day.lessonsCompleted || 0)
  }));

  // --- Helper Functions and Data for Yearly View ---

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-gray-200 dark:bg-gray-700";
      case 1:
        return "bg-blue-200 dark:bg-blue-900";
      case 2:
        return "bg-blue-400 dark:bg-blue-700";
      case 3:
        return "bg-blue-600 dark:bg-blue-500";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };

  // Get the start date (365 days ago) to calculate the first day's offset
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - TOTAL_DAYS + 1);
  const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Create an array of month labels for the header
  const monthLabels = Array.from({ length: 12 }).map((_, i) => {
    const month = new Date();
    month.setMonth(today.getMonth() - 11 + i);
    return month.toLocaleString("default", { month: "short" });
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Learning Activity</CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last year
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {/* Month Labels */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 ml-8 mb-2">
            {monthLabels.map((month) => (
              <span key={month} className="flex-1 text-center">
                {month}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day Labels (M, W, F) */}
            <div className="grid grid-rows-7 gap-y-[3px] text-xs text-gray-500 dark:text-gray-400 -mt-1">
              <span className="block h-3">Mon</span>

              <span className="block h-3">Tue</span>

              <span className="block h-3">Wed</span>
              <span className="block h-3">Thur</span>
              <span className="block h-3">Fri</span>
              <span className="block h-3">Sat</span>
              <span className="block h-3">Sun</span>
              <span></span>
            </div>

            {/* GitHub-style contribution grid */}
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-full">
              {/* Add empty cells to align the first day of the year correctly */}
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div key={`pad-${index}`} className="w-3 h-3 rounded-sm" />
              ))}

              {/* Map over the activity data */}
              {activityData.map((day, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(
                    day.intensity || 0
                  )}`}
                  title={`${day.date}: ${day.lessonsCompleted || 0} lessons completed`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center mt-4 text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" />
            <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900 rounded-sm" />
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-700 rounded-sm" />
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
