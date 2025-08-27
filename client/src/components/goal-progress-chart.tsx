import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

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
  x: number; // timestamp
  y: number; // cumulative completed count
}

interface GoalProgressChartProps {
  goalId: string;
}

export default function GoalProgressChart({ goalId }: GoalProgressChartProps) {
  const { data: goal } = useQuery<GoalWithDetails>({
    queryKey: ["goal", goalId],
    queryFn: async () => {
      const response = await fetch(`/api/goals/${goalId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch goal details");
      }
      return response.json();
    },
    enabled: !!goalId,
  });

  const chartData = useMemo(() => {
    if (!goal) return [];

    // Collect all subtopics with completion dates
    const completedSubtopics: { date: Date; name: string }[] = [];
    
    if (goal.categories && Array.isArray(goal.categories)) {
      goal.categories.forEach(category => {
        if (category && category.topics && Array.isArray(category.topics)) {
          category.topics.forEach(topic => {
            if (topic && topic.subtopics && Array.isArray(topic.subtopics)) {
              topic.subtopics.forEach(subtopic => {
                if (subtopic && subtopic.status === "completed" && subtopic.completedAt) {
                  completedSubtopics.push({
                    date: new Date(subtopic.completedAt),
                    name: subtopic.name
                  });
                }
              });
            }
          });
        }
      });
    }

    // Sort by completion date
    completedSubtopics.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Create cumulative data points
    const dataPoints: ChartDataPoint[] = [];
    
    if (completedSubtopics.length === 0) {
      // If no completed subtopics, show goal creation date with 0 progress
      const goalCreatedDate = new Date(goal.createdAt);
      const today = new Date();
      
      dataPoints.push({
        x: goalCreatedDate.getTime(),
        y: 0
      });
      
      dataPoints.push({
        x: today.getTime(),
        y: 0
      });
    } else {
      // Add goal creation as starting point
      const goalCreatedDate = new Date(goal.createdAt);
      dataPoints.push({
        x: goalCreatedDate.getTime(),
        y: 0
      });

      // Add each completion as an incremental step
      completedSubtopics.forEach((completion, index) => {
        dataPoints.push({
          x: completion.date.getTime(),
          y: index + 1
        });
      });
    }

    return dataPoints;
  }, [goal]);

  const totalSubtopics = useMemo(() => {
    if (!goal || !goal.categories) return 0;
    return goal.categories.reduce((total, category) => {
      if (!category || !category.topics) return total;
      return total + category.topics.reduce((topicTotal, topic) => {
        if (!topic || !topic.subtopics) return topicTotal;
        return topicTotal + topic.subtopics.length;
      }, 0);
    }, 0);
  }, [goal]);

  const completedCount = useMemo(() => {
    if (!goal || !goal.categories) return 0;
    return goal.categories.reduce((total, category) => {
      if (!category || !category.topics) return total;
      return total + category.topics.reduce((topicTotal, topic) => {
        if (!topic || !topic.subtopics) return topicTotal;
        return topicTotal + topic.subtopics.filter(s => s && s.status === "completed").length;
      }, 0);
    }, 0);
  }, [goal]);

  const state = {
    series: [{
      name: 'Completed Topics',
      data: chartData
    }],
    options: {
      chart: {
        type: 'area' as const,
        stacked: false,
        height: 350,
        zoom: {
          type: 'x' as const,
          enabled: true,
          autoScaleYaxis: true
        },
        toolbar: {
          autoSelected: 'zoom' as const
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 4,
        colors: ['#3b82f6'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 6,
        }
      },
      title: {
        text: 'Goal Progress Over Time',
        align: 'left' as const,
        style: {
          color: '#374151',
          fontSize: '16px',
          fontWeight: 600
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.6,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        },
      },
      yaxis: {
        labels: {
          formatter: function (val: number) {
            return Math.round(val).toString();
          },
          style: {
            colors: ['#6b7280']
          }
        },
        title: {
          text: 'Completed Subtopics',
          style: {
            color: '#374151',
            fontSize: '14px',
            fontWeight: 500
          }
        },
        min: 0,
        max: Math.max(totalSubtopics, 1)
      },
      xaxis: {
        type: 'datetime' as const,
        labels: {
          style: {
            colors: ['#6b7280']
          }
        }
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val: number) {
            return `${Math.round(val)} completed`;
          }
        },
        x: {
          format: 'dd MMM yyyy'
        }
      },
      stroke: {
        curve: 'straight' as const,
        width: 2,
        colors: ['#3b82f6']
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 3
      }
    },
  };

  if (!goal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Goal Progress Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-gray-500">
            Loading goal progress...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Real Progress Tracking
        </CardTitle>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Completed: {completedCount}</span>
          <span>Total: {totalSubtopics}</span>
          <span>Progress: {totalSubtopics > 0 ? Math.round((completedCount / totalSubtopics) * 100) : 0}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ReactApexChart 
            options={state.options} 
            series={state.series} 
            type="area" 
            height={350} 
          />
        </div>
      </CardContent>
    </Card>
  );
}