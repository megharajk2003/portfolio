import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

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

interface HeatMapDay {
  date: Date;
  goals: Goal[];
  intensity: number;
  color: string;
}

const GOAL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
];

export default function CompactGoalHeatMap() {
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"]
  });

  const heatMapData = useMemo(() => {
    // Get the last 5 months for compact view
    const today = new Date();
    const monthsData: { [key: string]: HeatMapDay } = {};
    
    // Initialize the last 5 months
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsData[monthKey] = {
        date,
        goals: [],
        intensity: 0,
        color: '#f3f4f6'
      };
    }

    // Process goals and assign to months
    const goalColorMap = new Map<string, string>();
    let colorIndex = 0;
    
    goals.forEach(goal => {
      // Assign unique color to each goal
      if (!goalColorMap.has(goal.id)) {
        goalColorMap.set(goal.id, GOAL_COLORS[colorIndex % GOAL_COLORS.length]);
        colorIndex++;
      }
      
      const createdDate = new Date(goal.createdAt);
      const updatedDate = new Date(goal.updatedAt);
      
      // Add goal to creation month
      const createdMonthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthsData[createdMonthKey]) {
        monthsData[createdMonthKey].goals.push(goal);
      }
      
      // If goal was updated in a different month, add to that month too
      const updatedMonthKey = `${updatedDate.getFullYear()}-${String(updatedDate.getMonth() + 1).padStart(2, '0')}`;
      if (updatedMonthKey !== createdMonthKey && monthsData[updatedMonthKey]) {
        const existingGoal = monthsData[updatedMonthKey].goals.find(g => g.id === goal.id);
        if (!existingGoal) {
          monthsData[updatedMonthKey].goals.push(goal);
        }
      }
    });

    // Calculate intensity and dominant color for each month
    Object.values(monthsData).forEach(month => {
      if (month.goals.length > 0) {
        // Calculate intensity based on number of goals and completion rate
        const totalCompletion = month.goals.reduce((sum, goal) => 
          sum + (goal.completedTopics / goal.totalTopics || 0), 0);
        const avgCompletion = totalCompletion / month.goals.length;
        month.intensity = Math.min(month.goals.length * avgCompletion * 0.3, 1);
        
        // Use the color of the most active goal (highest completion rate)
        const mostActiveGoal = month.goals.reduce((prev, current) => {
          const prevRate = prev.completedTopics / prev.totalTopics || 0;
          const currentRate = current.completedTopics / current.totalTopics || 0;
          return currentRate > prevRate ? current : prev;
        });
        
        const baseColor = goalColorMap.get(mostActiveGoal.id) || GOAL_COLORS[0];
        month.color = `${baseColor}${Math.round(month.intensity * 255).toString(16).padStart(2, '0')}`;
      }
    });

    return Object.values(monthsData);
  }, [goals]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Card className="w-full aspect-square" data-testid="compact-goal-heat-map">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          Activity Heat Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Heat map grid - 5 months in a single row */}
          <div className="grid grid-cols-5 gap-1">
            {heatMapData.map((month, index) => {
              const monthName = monthNames[month.date.getMonth()];
              
              return (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  data-testid={`compact-heat-map-month-${index}`}
                >
                  <div
                    className="w-full aspect-square rounded-md border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: month.color,
                      opacity: month.intensity > 0 ? 0.6 + (month.intensity * 0.4) : 0.3
                    }}
                  >
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {monthName}
                    </span>
                    {month.goals.length > 0 && (
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                        {month.goals.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip on hover */}
                  {month.goals.length > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
                        <div className="font-semibold">
                          {monthName} - {month.goals.length} goals
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Compact legend */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded border border-gray-300 dark:border-gray-600"
                  style={{ 
                    backgroundColor: `${GOAL_COLORS[0]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}