import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
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
  [key: string]: number | string; // Dynamic goal names as keys
}

const GOAL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

export default function GoalHeatMap() {
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"]
  });

  const chartData = useMemo(() => {
    if (goals.length === 0) return [];

    // Get the last 12 months
    const today = new Date();
    const monthsData: ChartDataPoint[] = [];

    // Initialize the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const dataPoint: ChartDataPoint = {
        date: monthKey,
        month: monthName
      };

      // Initialize all goals with 0 completed topics for this month
      goals.forEach(goal => {
        dataPoint[goal.name] = 0;
      });

      monthsData.push(dataPoint);
    }

    // Process each goal and calculate cumulative progress
    goals.forEach(goal => {
      const createdDate = new Date(goal.createdAt);
      const updatedDate = new Date(goal.updatedAt);

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
        // Set cumulative progress for each month
        for (let i = 0; i < monthsData.length; i++) {
          if (i < createdMonthIndex) {
            // Before creation, no progress
            monthsData[i][goal.name] = 0;
          } else if (i <= updatedMonthIndex) {
            // During active period, show current completed topics
            monthsData[i][goal.name] = goal.completedTopics;
          } else {
            // After last update, maintain the same progress
            monthsData[i][goal.name] = goal.completedTopics;
          }
        }
      }
    });

    return monthsData;
  }, [goals]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Card data-testid="goal-heat-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Study Performance
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This chart shows the cumulative number of topics you've completed for each goal over the past 12 months.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Line Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="month" 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'semibold' }}
                />
                <Legend />
                {goals.map((goal, index) => (
                  <Line
                    key={goal.id}
                    type="monotone"
                    dataKey={goal.name}
                    stroke={GOAL_COLORS[index % GOAL_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Goals Legend */}
          {goals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Target className="h-4 w-4" />
                Active Goals
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {goals.map((goal, index) => (
                  <Badge 
                    key={goal.id}
                    variant="outline"
                    className="text-xs flex items-center gap-2"
                    style={{ 
                      borderColor: GOAL_COLORS[index % GOAL_COLORS.length],
                      color: GOAL_COLORS[index % GOAL_COLORS.length]
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: GOAL_COLORS[index % GOAL_COLORS.length] }}
                    />
                    {goal.name}
                    <span className="text-gray-500 dark:text-gray-400">
                      ({goal.completedTopics}/{goal.totalTopics})
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}