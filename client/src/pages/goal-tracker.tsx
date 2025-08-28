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

// Get URL search params
const getURLParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    type: urlParams.get("type") || null,
  };
};

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

interface Goal {
  id: string;
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

interface ProgressDataPoint {
  date: string;
  [key: string]: number | string;
}

const GOAL_COLOR = "#3b82f6";

// API functions for goals
const fetchUserGoals = async () => {
  const response = await fetch("/api/goals", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch goals");
  }
  return response.json();
};

const fetchGoalCategories = async (goalId: string) => {
  const response = await fetch(`/api/goals/${goalId}/categories`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch goal categories");
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
  const currentYear = new Date().getFullYear();

  // Get URL parameters
  const { type: selectedGoalType } = getURLParams();

  // Fetch user goals
  const {
    data: goals = [],
    isLoading: goalsLoading,
    error: goalsError,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchUserGoals,
    enabled: !!user,
  });

  // Filter goals based on selected type
  const filteredGoals = useMemo(() => {
    if (!selectedGoalType) return goals;

    return goals.filter((goal: Goal) => {
      const goalName = goal.name.toLowerCase();
      const type = selectedGoalType.toLowerCase();

      // Dynamic filtering: check if goal name contains the type
      return goalName.includes(type);
    });
  }, [goals, selectedGoalType]);

  // Get all categories from filtered goals for detailed view
  const allCategories = useMemo(() => {
    const categories: GoalCategory[] = [];
    filteredGoals.forEach((goal: Goal) => {
      if (goal.categories) {
        goal.categories.forEach((category) => {
          categories.push({
            ...category,
            goalName: goal.name,
            goalId: goal.id,
          } as GoalCategory & { goalName: string });
        });
      }
    });
    return categories;
  }, [filteredGoals]);

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
  const ApexProgressChart: React.FC<{ categories: GoalCategory[] }> = ({
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
                  {selectedGoalType
                    ? `${selectedGoalType} Categories`
                    : "All Categories"}
                </h1>
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
          {goalsLoading && (
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
          {goalsError && (
            <Card>
              <CardContent className="p-6">
                <div className="text-red-600 dark:text-red-400">
                  Error loading goals: {(goalsError as Error).message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No goals state */}
          {!goalsLoading && !goalsError && goals.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Goals Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first goal by uploading a CSV file or manually
                  adding one.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Individual Categories for Detailed View */}
          {allCategories.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                All Categories
              </h2>
              <div className="space-y-4">
                {allCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() =>
                      navigate(
                        `/goal-tracker/${category.goalId}/category/${category.id}`
                      )
                    }
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        {category.name}
                        <Badge variant="outline" className="ml-auto">
                          {(category as any).goalName}
                        </Badge>
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
          {allCategories.length > 0 && (
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
                <ApexProgressChart categories={allCategories} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
