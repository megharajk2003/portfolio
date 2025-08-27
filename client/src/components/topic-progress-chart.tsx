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

interface TopicProgressChartProps {
  categoryId: string;
}

export default function TopicProgressChart({ categoryId }: TopicProgressChartProps) {
  const { data: topics = [] } = useQuery<GoalTopic[]>({
    queryKey: [`/api/goal-categories/${categoryId}/topics`],
    enabled: !!categoryId,
  });

  const chartData = useMemo(() => {
    if (topics.length === 0) return { series: [] };

    // Collect all real completion data from all topics
    const allCompletions: { topicName: string; timestamp: Date; }[] = [];
    
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        if (subtopic.status === "completed" && subtopic.completedAt) {
          allCompletions.push({
            topicName: topic.name,
            timestamp: new Date(subtopic.completedAt)
          });
        }
      });
    });

    // If no real completion data exists, return empty series
    if (allCompletions.length === 0) {
      return { series: [] };
    }

    // Sort chronologically
    allCompletions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Create series for each topic with real completion data
    const series = topics.map(topic => ({
      name: topic.name,
      data: [] as [number, number][]
    }));

    // Initialize cumulative counters
    const cumulativeCounts: { [topicName: string]: number } = {};
    topics.forEach(topic => (cumulativeCounts[topic.name] = 0));

    // Add starting points at first completion with 0 for all topics
    if (allCompletions.length > 0) {
      const startTime = allCompletions[0].timestamp.getTime() - 86400000; // 1 day before first completion
      topics.forEach(topic => {
        const seriesIndex = series.findIndex(s => s.name === topic.name);
        series[seriesIndex].data.push([startTime, 0]);
      });
    }

    // Process each completion to build cumulative progress
    allCompletions.forEach(({ topicName, timestamp }) => {
      cumulativeCounts[topicName]++;
      const seriesIndex = series.findIndex(s => s.name === topicName);
      
      if (seriesIndex > -1) {
        series[seriesIndex].data.push([timestamp.getTime(), cumulativeCounts[topicName]]);
      }
    });

    // Extend all series to current time with final counts
    const now = new Date().getTime();
    series.forEach(s => {
      if (s.data.length > 0 && s.data[s.data.length - 1][0] < now) {
        s.data.push([now, s.data[s.data.length - 1][1]]);
      }
    });

    return { series: series.filter(s => s.data.length > 1) }; // Only include topics with actual progress
  }, [topics]);

  const options: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      height: 350,
      zoom: { type: 'x', enabled: true, autoScaleYaxis: true },
      toolbar: { autoSelected: 'zoom' },
    },
    dataLabels: { enabled: false },
    markers: { size: 4 },
    title: {
      text: 'Topic Progress Over Time',
      align: 'left'
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
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1']
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Real Topic Progress
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Shows actual completion progress for each topic based on real subtopic completion timestamps.
        </p>
      </CardHeader>
      <CardContent>
        {chartData.series.length > 0 ? (
          <div className="h-80">
            <ReactApexChart 
              options={options} 
              series={chartData.series} 
              type="line" 
              height={320} 
            />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No completed subtopics yet for any topics. Start completing subtopics to see progress over time.
          </div>
        )}
      </CardContent>
    </Card>
  );
}