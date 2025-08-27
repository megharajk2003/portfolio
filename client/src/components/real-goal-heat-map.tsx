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

interface GoalSubtopic {
  id: string;
  name: string;
  status: "pending" | "start" | "completed";
  completedAt?: string;
  createdAt: string;
}

interface GoalTopic {
  id: string;
  name: string;
  subtopics: GoalSubtopic[];
}

interface GoalCategory {
  id: string;
  name: string;
  topics: GoalTopic[];
}

interface GoalWithDetails {
  id: string;
  name: string;
  categories: GoalCategory[];
  createdAt: string;
}

interface ChartDataPoint {
  date: number; // timestamp for proper time series
  dateLabel: string; // formatted date for display
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

export default function RealGoalHeatMap() {
  // Fetch goals with detailed subtopic data
  const { data: goals = [] } = useQuery<GoalWithDetails[]>({
    queryKey: ["/api/goals-with-details"],
    queryFn: async () => {
      const response = await fetch("/api/goals", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const goals = await response.json();
      
      // For each goal, fetch detailed data including subtopics
      const detailedGoals = await Promise.all(
        goals.map(async (goal: any) => {
          const detailResponse = await fetch(`/api/goals/${goal.id}`, {
            credentials: "include",
          });
          if (!detailResponse.ok) {
            return goal;
          }
          return detailResponse.json();
        })
      );
      
      return detailedGoals;
    }
  });

  const chartData = useMemo(() => {
    if (goals.length === 0) return [];

    // Get the last 14 days
    const today = new Date();
    const daysData: ChartDataPoint[] = [];

    // Initialize the last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const timestamp = date.getTime();
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

      const dataPoint: ChartDataPoint = {
        date: timestamp,
        dateLabel: dateLabel
      };

      // Initialize all goals with 0 completed topics for this day
      goals.forEach(goal => {
        dataPoint[goal.name] = 0;
      });

      daysData.push(dataPoint);
    }

    // Process each goal to populate the chart data with REAL completion data
    goals.forEach(goal => {
      // Collect all completed subtopics with their completion dates
      const completedSubtopics: { date: Date; count: number }[] = [];
      
      goal.categories.forEach(category => {
        category.topics.forEach(topic => {
          topic.subtopics.forEach(subtopic => {
            if (subtopic.status === "completed" && subtopic.completedAt) {
              const completionDate = new Date(subtopic.completedAt);
              completionDate.setHours(0, 0, 0, 0); // Normalize to start of day
              
              // Find existing entry for this date or create new one
              const existingEntry = completedSubtopics.find(entry => 
                entry.date.getTime() === completionDate.getTime()
              );
              
              if (existingEntry) {
                existingEntry.count += 1;
              } else {
                completedSubtopics.push({
                  date: completionDate,
                  count: 1
                });
              }
            }
          });
        });
      });

      // Sort by date
      completedSubtopics.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate cumulative progress for each day in the 2-week period
      let cumulativeCompleted = 0;
      daysData.forEach(dayData => {
        const dayDate = new Date(dayData.date); // dayData.date is now a timestamp
        dayDate.setHours(0, 0, 0, 0);

        // Add completions from this day
        const completionsOnThisDay = completedSubtopics.filter(completion => 
          completion.date.getTime() === dayDate.getTime()
        );
        
        const completionsToday = completionsOnThisDay.reduce((sum, comp) => sum + comp.count, 0);
        cumulativeCompleted += completionsToday;

        dayData[goal.name] = cumulativeCompleted;
      });
    });

    return daysData;
  }, [goals]);

  const totalGoals = goals.length;
  const totalCompletedSubtopics = goals.reduce((total, goal) => 
    total + goal.categories.reduce((catTotal, category) => 
      catTotal + category.topics.reduce((topicTotal, topic) => 
        topicTotal + topic.subtopics.filter(s => s.status === "completed").length, 0), 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Real Goal Progress (Last 2 Weeks)
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {totalGoals} Goals
          </Badge>
          <span>{totalCompletedSubtopics} Completed Subtopics</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(timestamp) => {
                      const date = new Date(timestamp);
                      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    }}
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
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No goal data available</p>
                <p className="text-sm">Create some goals and start completing subtopics to see your progress!</p>
              </div>
            </div>
          )}
          
          {totalCompletedSubtopics > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Recent Progress
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on actual completion dates from your subtopics
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalCompletedSubtopics}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completed
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}