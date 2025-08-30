import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCalendarProps {
  userId: string;
}

const DAY = 24 * 60 * 60 * 1000;

// Local YYYY-MM-DD (no UTC shift)
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export default function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const { data: dailyActivity = [] } = useQuery<
    { date: string; lessonsCompleted: number }[]
  >({
    queryKey: ["/api/daily-activity", userId],
  });
  console.log("dailyActivity :;", dailyActivity);
  // --- 1) Rolling 12 months: from 1st of same month last year -> today (inclusive) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // local midnight

  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); // first of month, last year
  const endDate = new Date(today); // today

  const daysDiffInclusive =
    Math.round((endDate.getTime() - startDate.getTime()) / DAY) + 1;

  const activityMap = new Map(dailyActivity.map((d) => [d.date, d]));

  const fullCalendarData = Array.from({ length: daysDiffInclusive }).map(
    (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateString = toYMD(d); // local YYYY-MM-DD

      const activity = activityMap.get(dateString);
      const lessonsCompleted = activity?.lessonsCompleted ?? 0;

      let intensity = 0;
      if (lessonsCompleted > 0 && lessonsCompleted <= 2) intensity = 1;
      else if (lessonsCompleted > 2 && lessonsCompleted <= 4) intensity = 2;
      else if (lessonsCompleted > 4) intensity = 3;

      return { date: dateString, lessonsCompleted, intensity };
    }
  );

  // --- 2) Group into weeks (left pad to Monday, right pad to complete last week) ---
  const startDayOfWeek = (startDate.getDay() + 6) % 7; // Monday=0
  const leftPad = Array(startDayOfWeek).fill(null);

  // right pad so the very last column is a full 7-row week
  const totalCellsSoFar = startDayOfWeek + fullCalendarData.length;
  const rightPadCount = (7 - (totalCellsSoFar % 7)) % 7;
  const rightPad = Array(rightPadCount).fill(null);

  const paddedDays = [...leftPad, ...fullCalendarData, ...rightPad];

  const weeks: ((typeof fullCalendarData)[number] | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // --- 3) Month labels: position using (leftPad + indexOf(1st-of-month)) / 7 ---
  const monthLabels: { label: string; weekIndex: number }[] = [];

  // Always show label for the starting month
  monthLabels.push({
    label: startDate.toLocaleString("default", { month: "short" }),
    weekIndex: 0,
  });

  for (let i = 0; i < fullCalendarData.length; i++) {
    const d = new Date(fullCalendarData[i].date);
    if (d.getDate() === 1) {
      const isStartMonth =
        d.getFullYear() === startDate.getFullYear() &&
        d.getMonth() === startDate.getMonth();
      if (isStartMonth) continue;

      const absoluteIndex = startDayOfWeek + i; // include left padding
      const weekIndex = Math.floor(absoluteIndex / 7);

      const label = d.toLocaleString("default", { month: "short" });
      // avoid duplicates if the 1st falls in the same week as the previous label
      if (
        !monthLabels.length ||
        monthLabels[monthLabels.length - 1].weekIndex !== weekIndex
      ) {
        monthLabels.push({ label, weekIndex });
      }
    }
  }

  // --- Coloring ---
  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 1:
        return "bg-sky-300 dark:bg-sky-800";
      case 2:
        return "bg-sky-500 dark:bg-sky-600";
      case 3:
        return "bg-sky-700 dark:bg-sky-400";
      default:
        return "bg-slate-200 dark:bg-slate-800";
    }
  };

  // Labels aligned to the 7 grid rows (Mon..Sun). Leave Sat/Sun blank if you prefer.
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Learning Activity</CardTitle>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Last year
          </span>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        {/* Calendar grid */}
        <div className="flex mt-2">
          {/* Weekday labels */}
          <div className="grid grid-rows-7 gap-1 text-xs text-slate-500 dark:text-slate-400 mr-2">
            {weekdayLabels.map((w, i) => (
              <div key={i} className="h-3 flex items-center">
                {w}
              </div>
            ))}
          </div>

          {/* Weeks (month labels + dots share same columns) */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col items-center">
                {/* Month label */}
                <div className="h-4 mb-1 flex justify-center">
                  {monthLabels.find((m) => m.weekIndex === weekIndex)?.label ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {
                        monthLabels.find((m) => m.weekIndex === weekIndex)
                          ?.label
                      }
                    </span>
                  ) : (
                    <span className="text-xs">&nbsp;</span> // keeps column width stable
                  )}
                </div>

                {/* Dots column */}
                <div className="grid grid-rows-7 gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={day ? day.date : `pad-${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-full ${
                        day ? getIntensityClass(day.intensity) : "opacity-0"
                      }`}
                      title={
                        day
                          ? `${day.date}: ${day.lessonsCompleted} lessons`
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center mt-4 text-xs text-slate-500 dark:text-slate-400 space-x-2">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="w-3 h-3 bg-sky-300 dark:bg-sky-800 rounded-full" />
            <div className="w-3 h-3 bg-sky-500 dark:bg-sky-600 rounded-full" />
            <div className="w-3 h-3 bg-sky-700 dark:bg-sky-400 rounded-full" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
