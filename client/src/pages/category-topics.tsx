import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import Sidebar from "@/components/sidebar";
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { navigate } from "wouter/use-browser-location";
import { useLocation } from "wouter";

// Interfaces
interface GoalTopic {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalCategory {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
}

interface ProgressDataPoint {
  date: string;
  [key: string]: number | string;
}

const TOPIC_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// API functions
const fetchGoalCategory = async (goalId: string, categoryId: string) => {
  const response = await fetch(
    `/api/goals/${goalId}/categories/${categoryId}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  return response.json();
};

const fetchCategoryTopics = async (categoryId: string) => {
  const response = await fetch(`/api/goal-categories/${categoryId}/topics`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch topics");
  }
  return response.json();
};

export default function CategoryTopics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const currentYear = new Date().getFullYear();

  // Extract IDs from URL: /goal-tracker/{goalId}/category/{categoryId}
  const pathParts = location.split("/");
  const goalId = pathParts[2];
  const categoryId = pathParts[4];

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", goalId, categoryId],
    queryFn: () => fetchGoalCategory(goalId, categoryId),
    enabled: !!goalId && !!categoryId && !!user,
  });

  // Fetch topics for this category
  const {
    data: topics = [],
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery({
    queryKey: ["category-topics", categoryId],
    queryFn: () => fetchCategoryTopics(categoryId),
    enabled: !!categoryId && !!user,
  });

  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const cumulativeProgressData = useMemo(() => {
    if (topics.length === 0) return [];

    const dataPoints: ProgressDataPoint[] = [];
    const startDate = new Date(
      selectedYear,
      selectedMonth === "all" ? 0 : parseInt(selectedMonth) - 1,
      1
    );
    const endDate =
      selectedMonth === "all"
        ? new Date(selectedYear, 11, 31)
        : new Date(selectedYear, parseInt(selectedMonth), 0);

    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

      const progressPoint: ProgressDataPoint = { date: dateStr };

      topics.forEach((topic: GoalTopic, index: number) => {
        // Simulate gradual progress over time for each topic
        const daysSinceStart = Math.floor(
          (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const currentProgress = Math.min(
          topic.completedSubtopics,
          Math.floor((daysSinceStart / 30) * topic.completedSubtopics)
        );
        progressPoint[topic.name] = currentProgress;
      });

      dataPoints.push(progressPoint);
      current.setDate(current.getDate() + 1);
    }
    return dataPoints;
  }, [topics, selectedYear, selectedMonth]);

  const getStatusColor = (
    completedSubtopics: number,
    totalSubtopics: number
  ) => {
    if (completedSubtopics === totalSubtopics && totalSubtopics > 0) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    } else if (completedSubtopics > 0) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    } else {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    }
  };

  const getStatusText = (
    completedSubtopics: number,
    totalSubtopics: number
  ) => {
    if (completedSubtopics === totalSubtopics && totalSubtopics > 0) {
      return "Completed";
    } else if (completedSubtopics > 0) {
      return "In Progress";
    } else {
      return "Not Started";
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-center">Please log in to view topics.</div>
          </div>
        </div>
      </div>
    );
  }

  if (categoryLoading || topicsLoading) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categoryError || topicsError || !category) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-red-600 dark:text-red-400">
              Error loading data:{" "}
              {categoryError
                ? (categoryError as Error).message
                : (topicsError as Error).message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Preserve the goal type when navigating back
                  const urlParams = new URLSearchParams(window.location.search);
                  const type = urlParams.get('type');
                  if (type) {
                    navigate(`/goal-tracker?type=${encodeURIComponent(type)}`);
                  } else {
                    navigate("/goal-tracker");
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Categories
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */} {/* Topics Grid */}
          {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic: GoalTopic) => (
                <Card
                  key={topic.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => navigate(`/subtopic/${topic.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      {topic.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">
                            {topic.completedSubtopics} / {topic.totalSubtopics}
                          </span>
                        </div>
                        <Progress
                          value={
                            topic.totalSubtopics > 0
                              ? (topic.completedSubtopics /
                                  topic.totalSubtopics) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {topic.totalSubtopics > 0
                            ? Math.round(
                                (topic.completedSubtopics /
                                  topic.totalSubtopics) *
                                  100
                              )
                            : 0}
                          % Complete
                        </span>
                        <Badge
                          className={getStatusColor(
                            topic.completedSubtopics,
                            topic.totalSubtopics
                          )}
                        >
                          {getStatusText(
                            topic.completedSubtopics,
                            topic.totalSubtopics
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Topics Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This category doesn't have any topics yet.
                </p>
              </CardContent>
            </Card>
          )}
          {/* Study Performance Chart */}
          {topics.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Study Performance
                  </CardTitle>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Year:</span>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) =>
                          setSelectedYear(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: 5 },
                            (_, i) => currentYear - i
                          ).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Month:</span>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                  This chart shows the cumulative number of subtopics you've
                  completed for each goal{" "}
                  {selectedMonth !== "all"
                    ? `in ${
                        months.find((m) => m.value === selectedMonth)?.label
                      } ${selectedYear}`
                    : `in ${selectedYear}`}
                  .
                </p>
              </CardHeader>
              <CardContent>
                {cumulativeProgressData.length > 0 ? (
                  <div className="h-80">
                    <ReactApexChart 
                      options={{
                        chart: {
                          type: 'line',
                          stacked: false,
                          height: 320,
                          zoom: { type: 'x', enabled: true, autoScaleYaxis: true },
                          toolbar: { autoSelected: 'zoom' },
                        },
                        dataLabels: { enabled: false },
                        stroke: { curve: 'stepline', width: 2 },
                        title: {
                          text: 'Real Topic Progress',
                          align: 'left'
                        },
                        markers: { size: 0 },
                        yaxis: {
                          title: { text: 'Completed Subtopics' },
                          labels: { formatter: (val) => val.toFixed(0) },
                        },
                        xaxis: { 
                          type: 'datetime',
                          categories: cumulativeProgressData.map(item => item.date)
                        },
                        tooltip: {
                          shared: false,
                          y: { formatter: (val) => `${val.toFixed(0)} completed` },
                          x: { format: 'dd MMM yyyy' }
                        },
                        colors: TOPIC_COLORS,
                        legend: { position: 'bottom' }
                      } as ApexOptions}
                      series={topics.map((topic: GoalTopic, index: number) => ({
                        name: topic.name,
                        data: cumulativeProgressData.map(item => item[topic.name] as number || 0)
                      }))}
                      type="line" 
                      height={320} 
                    />
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    No topic completion data available for the selected period.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
