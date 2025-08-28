import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, TrendingUp, Upload, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/sidebar";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { navigate } from "wouter/use-browser-location";
import { useLocation } from "wouter";


// Interfaces for the Goal tracking system
interface GoalCategory {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  completedSubtopicTimestamps?: string[];
  createdAt: string;
}

interface GoalTopic {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  totalSubtopics: number;
  completedSubtopics: number;
  subtopics: GoalSubtopic[];
}

interface GoalSubtopic {
  id: string;
  topicId: string;
  name: string;
  description?: string;
  status: "pending" | "start" | "completed";
  priority: "low" | "medium" | "high";
  notes?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalWithDetails {
  id: string;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
  categories: (GoalCategory & {
    topics: (GoalTopic & { subtopics: GoalSubtopic[] })[];
  })[];
}

interface ProgressDataPoint {
  date: string;
  [key: string]: number | string;
}

const GOAL_COLOR = "#3b82f6";

// API functions
const fetchGoalWithCategories = async (goalId: string): Promise<GoalWithDetails> => {
  const response = await fetch(`/api/goals/${goalId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch goal details");
  }
  return response.json();
};

const createGoalFromCSVApi = async (data: {
  goalName: string;
  csvData: any[];
}) => {
  const response = await fetch("/api/goals/from-csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create goal from CSV");
  }
  return response.json();
};

export default function GoalTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Extract goal ID from URL: /goal-tracker/{goalId}
  const goalId = location.split("/")[2];

  // Fetch specific goal with categories
  const {
    data: goal,
    isLoading: goalLoading,
    error: goalError,
  } = useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => fetchGoalWithCategories(goalId),
    enabled: !!goalId && !!user,
  });

  // Extract categories from the goal
  const categories = useMemo(() => {
    return goal?.categories || [];
  }, [goal]);

  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [goalName, setGoalName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // CSV upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: createGoalFromCSVApi,
    onSuccess: () => {
      toast({ title: "Success!", description: "Goal created from CSV" });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setCsvFile(null);
      setGoalName("");
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());
          if (lines.length < 2) {
            reject(
              new Error("CSV must have a header and at least one data row")
            );
            return;
          }
          const headers = lines[0]
            .split(",")
            .map((h) => h.trim().toLowerCase());
          const data = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });
            return row;
          });
          resolve(data);
        } catch (error) {
          reject(new Error("Failed to parse CSV file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleCSVUpload = async () => {
    if (!csvFile || !goalName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a goal name",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    try {
      const csvData = await parseCSV(csvFile);
      await csvUploadMutation.mutateAsync({
        goalName: goalName.trim(),
        csvData,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ApexChart Component for Category Progress
  const ApexProgressChart: React.FC<{ categories: (GoalCategory & { topics: GoalTopic[] })[] }> = ({
    categories,
  }) => {
    const chartState = useMemo(() => {
      const validCategories = categories.filter((cat) => cat && cat.name);
      const series = validCategories.map((category) => ({
        name: category.name,
        data: [] as [number, number][],
      }));

      // Collect all completion timestamps from all categories
      const allTimestamps = validCategories
        .flatMap((cat) =>
          (cat.completedSubtopicTimestamps || []).map((ts) => ({
            catName: cat.name,
            timestamp: new Date(ts),
          }))
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // If no completion data, return empty series
      if (allTimestamps.length === 0) {
        return { series: [] };
      }

      const cumulativeCounts: { [key: string]: number } = {};
      validCategories.forEach((cat) => (cumulativeCounts[cat.name] = 0));

      // Add a starting point for each category at its creation date
      validCategories.forEach((cat) => {
        const seriesIndex = series.findIndex((s) => s.name === cat.name);
        if (seriesIndex > -1 && cat.createdAt) {
          const startDate = new Date(cat.createdAt).getTime();
          series[seriesIndex].data.push([startDate, 0]);
        }
      });

      // Build the incremental, cumulative data points from real completion data
      allTimestamps.forEach(({ catName, timestamp }) => {
        cumulativeCounts[catName]++;
        const seriesIndex = series.findIndex((s) => s.name === catName);
        if (seriesIndex > -1) {
          series[seriesIndex].data.push([
            timestamp.getTime(),
            cumulativeCounts[catName],
          ]);
        }
      });

      // Extend all lines to current time with final counts
      const now = new Date().getTime();
      series.forEach((s) => {
        if (s.data.length > 0 && s.data[s.data.length - 1][0] < now) {
          s.data.push([now, s.data[s.data.length - 1][1]]);
        }
      });

      // Only return series that have actual data points
      return { series: series.filter((s) => s.data.length > 1) };
    }, [categories]);

    // Options object adapted from your template
    const options: ApexOptions = {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        zoom: { type: "x", enabled: true, autoScaleYaxis: true },
        toolbar: { autoSelected: "zoom" },
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      title: {
        text: "Category Progress Over Time",
        align: "left",
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      yaxis: {
        title: { text: "Subtopics Completed" },
        labels: { formatter: (val) => val.toFixed(0) },
      },
      xaxis: { type: "datetime" },
      tooltip: {
        shared: false,
        y: { formatter: (val) => val.toFixed(0) },
      },
      stroke: { curve: "stepline" }, // Use 'stepline' to show incremental progress accurately
    };

    if (chartState.series.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No completed subtopics yet. Start completing subtopics to see progress
          over time.
        </div>
      );
    }

    return (
      <div>
        <div id="chart">
          <ReactApexChart
            options={options}
            series={chartState.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    );
  };

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

  // Show loading state if user is not loaded yet
  if (!user) {
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

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {goal?.name || "Goal Categories"}
                </h1>
                {goal?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/goals")}
                className="flex items-center gap-2"
                data-testid="button-back-to-goals"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Goals
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto p-6 space-y-6">
          {/* Loading state */}
          {goalLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {goalError && (
            <Card>
              <CardContent className="p-6">
                <div className="text-red-600 dark:text-red-400">
                  Error loading goal: {(goalError as Error).message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No categories state */}
          {!goalLoading && !goalError && goal && categories.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Categories Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This goal doesn't have any categories yet. Try uploading a CSV file to populate it.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Goal Overview */}
          {goal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Goal Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {goal.categories.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Categories
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {goal.totalTopics}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Topics
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {goal.totalSubtopics}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Subtopics
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {goal.completedSubtopics}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completed
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((goal.completedSubtopics / goal.totalSubtopics) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={goal.totalSubtopics > 0 ? (goal.completedSubtopics / goal.totalSubtopics) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories for Detailed View */}
          {categories.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Categories
              </h2>
              <div className="space-y-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() =>
                      navigate(
                        `/goal-tracker/${goalId}/category/${category.id}`
                      )
                    }
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Overall Progress
                            </span>
                            <span className="text-sm text-gray-600">
                              {category.completedSubtopics || 0} /{" "}
                              {category.totalSubtopics || 0} Subtopics
                            </span>
                          </div>
                          <Progress
                            value={
                              category.totalSubtopics > 0
                                ? ((category.completedSubtopics || 0) /
                                    category.totalSubtopics) *
                                  100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {category.totalSubtopics > 0
                              ? Math.round(
                                  ((category.completedSubtopics || 0) /
                                    category.totalSubtopics) *
                                    100
                                )
                              : 0}
                            % Complete
                          </span>
                          <Badge
                            className={getStatusColor(
                              category.completedSubtopics || 0,
                              category.totalSubtopics || 0
                            )}
                          >
                            {getStatusText(
                              category.completedSubtopics || 0,
                              category.totalSubtopics || 0
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Performance Line Chart */}
          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Category Progress Trend
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ApexProgressChart categories={categories} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
