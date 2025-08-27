import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target } from "lucide-react";
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

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

interface Goal {
  id: string;
  userId: number;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
  categories?: GoalCategory[];
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
    if (goals.length === 0) return { series: [] };

    // Collect all real completion data from all goals
    const allCompletions: { goalName: string; timestamp: Date; }[] = [];
    
    goals.forEach(goal => {
      if (goal.categories) {
        goal.categories.forEach(category => {
          if (category.topics) {
            category.topics.forEach(topic => {
              if (topic.subtopics) {
                topic.subtopics.forEach(subtopic => {
                  if (subtopic.status === "completed" && subtopic.completedAt) {
                    allCompletions.push({
                      goalName: goal.name,
                      timestamp: new Date(subtopic.completedAt)
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    // If no real completion data exists, return empty series
    if (allCompletions.length === 0) {
      return { series: [] };
    }

    // Sort chronologically
    allCompletions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Create series for each goal with real completion data
    const series = goals.map(goal => ({
      name: goal.name,
      data: [] as [number, number][]
    }));

    // Initialize cumulative counters
    const cumulativeCounts: { [goalName: string]: number } = {};
    goals.forEach(goal => (cumulativeCounts[goal.name] = 0));

    // Add starting points at goal creation with 0 completions
    goals.forEach(goal => {
      const seriesIndex = series.findIndex(s => s.name === goal.name);
      series[seriesIndex].data.push([new Date(goal.createdAt).getTime(), 0]);
    });

    // Process each completion to build cumulative progress
    allCompletions.forEach(({ goalName, timestamp }) => {
      cumulativeCounts[goalName]++;
      const seriesIndex = series.findIndex(s => s.name === goalName);
      
      if (seriesIndex > -1) {
        series[seriesIndex].data.push([timestamp.getTime(), cumulativeCounts[goalName]]);
      }
    });

    // Extend all series to current time with final counts
    const now = new Date().getTime();
    series.forEach(s => {
      if (s.data.length > 0 && s.data[s.data.length - 1][0] < now) {
        s.data.push([now, s.data[s.data.length - 1][1]]);
      }
    });

    return { series: series.filter(s => s.data.length > 1) }; // Only include goals with actual progress
  }, [goals]);

  const options: ApexOptions = {
    chart: {
      type: 'area',
      stacked: false,
      height: 350,
      zoom: { type: 'x', enabled: true, autoScaleYaxis: true },
      toolbar: { autoSelected: 'zoom' },
    },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    title: {
      text: 'Real Goal Progress Over Time',
      align: 'left'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      },
    },
    yaxis: {
      title: { text: 'Completed Subtopics' },
      labels: { formatter: (val) => val.toFixed(0) },
    },
    xaxis: { type: 'datetime' },
    tooltip: {
      shared: false,
      y: { formatter: (val) => `${val.toFixed(0)} completed` },
      x: { format: 'dd MMM yyyy HH:mm' }
    },
    stroke: { curve: 'stepline', width: 2 },
    colors: GOAL_COLORS
  };

  return (
    <Card data-testid="goal-heat-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Real Study Performance
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This chart shows actual completion progress based on real subtopic completion timestamps.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ApexChart */}
          {chartData.series.length > 0 ? (
            <div className="h-80">
              <ReactApexChart 
                options={options} 
                series={chartData.series} 
                type="area" 
                height={320} 
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No completed subtopics yet. Start completing subtopics to see progress over time.
            </div>
          )}

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
                      ({goal.completedSubtopics || 0}/{goal.totalSubtopics || 0})
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