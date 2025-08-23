import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target } from "lucide-react";

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

  const heatMapData = useMemo(() => {
    // Get the last 12 months
    const today = new Date();
    const monthsData: { [key: string]: HeatMapDay } = {};
    
    // Initialize the last 12 months
    for (let i = 11; i >= 0; i--) {
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
        month.intensity = Math.min(month.goals.length * avgCompletion * 0.25, 1);
        
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
    <Card data-testid="goal-heat-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Learning Heat Map
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monthly goal activity over the past 12 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heat map grid */}
          <div className="grid grid-cols-6 gap-2">
            {heatMapData.map((month, index) => {
              const monthName = monthNames[month.date.getMonth()];
              const year = month.date.getFullYear();
              
              return (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  data-testid={`heat-map-month-${index}`}
                >
                  <div
                    className="w-full h-16 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: month.color,
                      opacity: month.intensity > 0 ? 0.6 + (month.intensity * 0.4) : 0.3
                    }}
                  >
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {monthName}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {year}
                    </span>
                    {month.goals.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="h-3 w-3" />
                        <span className="text-xs font-bold">
                          {month.goals.length}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  {month.goals.length > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-48">
                        <div className="font-semibold mb-1">
                          {monthName} {year}
                        </div>
                        <div className="space-y-1">
                          {month.goals.slice(0, 3).map(goal => (
                            <div key={goal.id} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOAL_COLORS[goals.indexOf(goal) % GOAL_COLORS.length] }}></div>
                              <span className="truncate">{goal.name}</span>
                            </div>
                          ))}
                          {month.goals.length > 3 && (
                            <div className="text-gray-400">
                              +{month.goals.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>Less active</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600"
                    style={{ 
                      backgroundColor: `${GOAL_COLORS[0]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
                    }}
                  />
                ))}
              </div>
              <span>More active</span>
            </div>
            
            {goals.length > 0 && (
              <div className="flex items-center gap-2">
                <span>Goals:</span>
                <div className="flex gap-1 flex-wrap">
                  {goals.slice(0, 5).map((goal, index) => (
                    <Badge 
                      key={goal.id}
                      variant="outline"
                      className="text-xs"
                      style={{ 
                        borderColor: GOAL_COLORS[index % GOAL_COLORS.length],
                        color: GOAL_COLORS[index % GOAL_COLORS.length]
                      }}
                    >
                      {goal.name}
                    </Badge>
                  ))}
                  {goals.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{goals.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}