import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

interface Goal {
  id: string;
  userId: number;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
  updatedAt: string;
}

interface ChartDataPoint {
  date: string;
  month: string;
  totalCompleted: number;
}

export default function CompactGoalHeatMap() {
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"]
  });

  const chartData = useMemo(() => {
    // Get the last 5 months for compact view
    const today = new Date();
    const monthsData: ChartDataPoint[] = [];

    // Initialize the last 5 months
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      monthsData.push({
        date: monthKey,
        month: monthName,
        totalCompleted: 0
      });
    }

    // Calculate cumulative progress for all goals combined
    goals.forEach(goal => {
      // Parse the ISO string and extract date components directly from the string to avoid timezone issues
      const createdDateStr = goal.createdAt.split('T')[0]; // Get just the date part (YYYY-MM-DD)
      const updatedDateStr = goal.updatedAt.split('T')[0]; // Get just the date part (YYYY-MM-DD)
      
      const createdDate = new Date(createdDateStr + 'T00:00:00'); // Local midnight
      const updatedDate = new Date(updatedDateStr + 'T00:00:00'); // Local midnight

      // Find the month when the goal was created
      const createdMonthIndex = monthsData.findIndex(month => {
        const monthDate = new Date(month.date + '-01');
        return monthDate.getFullYear() === createdDate.getFullYear() && 
               monthDate.getMonth() === createdDate.getMonth();
      });

      // Find the month when the goal was last updated
      const updatedMonthIndex = monthsData.findIndex(month => {
        const monthDate = new Date(month.date + '-01');
        return monthDate.getFullYear() === updatedDate.getFullYear() && 
               monthDate.getMonth() === updatedDate.getMonth();
      });

      if (createdMonthIndex !== -1) {
        // Add completed topics to each month from creation onwards
        for (let i = createdMonthIndex; i < monthsData.length; i++) {
          if (i <= updatedMonthIndex) {
            monthsData[i].totalCompleted += goal.completedTopics;
          } else {
            monthsData[i].totalCompleted += goal.completedTopics;
          }
        }
      }
    });

    return monthsData;
  }, [goals]);

  const totalGoals = goals.length;
  const totalCompleted = goals.reduce((sum, goal) => sum + goal.completedTopics, 0);

  return (
    <Card className="w-full" data-testid="compact-goal-heat-map">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Progress Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Mini Line Chart */}
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="totalCompleted"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {totalGoals}
              </div>
              <div>Goals</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {totalCompleted}
              </div>
              <div>Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {chartData.length > 1 ? 
                  (chartData[chartData.length - 1].totalCompleted - chartData[chartData.length - 2].totalCompleted >= 0 ? '+' : '') +
                  (chartData[chartData.length - 1].totalCompleted - chartData[chartData.length - 2].totalCompleted)
                  : '0'
                }
              </div>
              <div>This Month</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}