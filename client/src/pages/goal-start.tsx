import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Target, Upload, BookOpen, TrendingUp } from "lucide-react";
import Sidebar from "@/components/sidebar";
import GoalHeatMap from "@/components/goal-heat-map";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { navigate } from "wouter/use-browser-location";

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

// ==================================================================
// 1. NEW ApexChart Component for Goal Progress (Bar Chart)
// ==================================================================
const ApexGoalProgressBarChart: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  const chartData = useMemo(() => {
    return goals.map((goal) => ({
      x: goal.name,
      y:
        goal.totalSubtopics > 0
          ? Math.round((goal.completedSubtopics / goal.totalSubtopics) * 100)
          : 0,
      completed: goal.completedSubtopics,
      total: goal.totalSubtopics,
    }));
  }, [goals]);

  const options: ApexOptions = {
    chart: { type: "bar", height: 300, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.map((item) => item.x),
      title: { text: "Progress Percentage" },
      max: 100,
      min: 0,
    },
    yaxis: { title: { text: "Goals" } },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const data = chartData[dataPointIndex];
        return `<div style="padding: 10px;">
                    <strong>${data.x}</strong><br/>
                    Progress: ${data.y}%<br/>
                    Completed: ${data.completed}/${data.total}
                </div>`;
      },
    },
    colors: ["#3b82f6"],
  };

  const series = [
    {
      name: "Progress %",
      data: chartData.map((item) => item.y),
    },
  ];

  return (
    <ReactApexChart options={options} series={series} type="bar" height={300} />
  );
};

// ==================================================================
// 2. NEW ApexChart Component for Effort Distribution (Pie Chart)
// ==================================================================
const ApexGoalPieChart: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  const chartData = useMemo(() => {
    return goals
      .filter((goal) => goal.completedSubtopics > 0)
      .map((goal) => ({
        name: goal.name,
        value: goal.completedSubtopics,
      }));
  }, [goals]);

  const options: ApexOptions = {
    chart: { type: "pie", height: 300 },
    labels: chartData.map((item) => item.name),
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (val) => `${val} subtopics` } },
  };

  const series = chartData.map((item) => item.value);

  if (series.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No completed subtopics yet.
      </div>
    );
  }

  return (
    <ReactApexChart options={options} series={series} type="pie" height={300} />
  );
};

export default function GoalStart() {
  const { user } = useAuth();
  const { toast } = useToast();

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

  // Use goals directly instead of grouping by type
  const sortedGoals = useMemo(() => {
    return [...goals].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [goals]);

  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [goalName, setGoalName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
      const response = await createGoalFromCSVApi({
        goalName: goalName.trim(),
        csvData,
      });
      toast({ title: "Success!", description: "Goal created from CSV" });
      setCsvFile(null);
      setGoalName("");
      // Refresh the goals data
      window.location.reload();
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

  const getTypeIcon = (type: string) => {
    // Return a default icon for all types
    return "📚";
  };

  const getTypeDescription = (type: string) => {
    // Return a generic description for all types
    return "Learning & Preparation";
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
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Goal Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Start your learning journey with CSV-based goal tracking
              </p>
            </div>

            {/* CSV Upload Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  data-testid="button-upload-csv"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Goal from CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input
                      id="goalName"
                      data-testid="input-goal-name"
                      placeholder="e.g., TNPSC Group 2, SSC CGL Preparation"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="csvFile">CSV File</Label>
                    <Input
                      id="csvFile"
                      data-testid="input-csv-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      CSV should contain columns: Category, Topics, Sub-topics,
                      Status.
                    </p>
                  </div>
                  <Button
                    onClick={handleCSVUpload}
                    disabled={isUploading || !csvFile || !goalName.trim()}
                    className="w-full"
                    data-testid="button-create-goal"
                  >
                    {isUploading ? "Uploading..." : "Create Goal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Loading state */}
          {goalsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error state */}
          {goalsError && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-red-600 dark:text-red-400">
                  Error loading goals: {(goalsError as Error).message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No goals state */}
          {!goalsLoading && !goalsError && goals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Start Your Learning Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload your first CSV file to begin tracking your preparation
                  goals. Support for TNPSC, SSC, UPSC, Banking, and other
                  competitive exams.
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  CSV Format: Category, Topics, Sub-topics, Status
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Goal Cards Display */}
          {sortedGoals.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedGoals.map((goal) => {
                  const progressPercentage =
                    goal.totalSubtopics > 0
                      ? ((goal.completedSubtopics || 0) / goal.totalSubtopics) *
                        100
                      : 0;

                  return (
                    <Card
                      key={goal.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-l-4 border-l-blue-500"
                      onClick={() => navigate(`/goal-tracker/${goal.id}`)}
                      data-testid={`card-goal-${goal.id}`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getTypeIcon(goal.name)}
                          </div>
                          <div>
                            <div className="text-xl font-bold">{goal.name}</div>
                            <div className="text-sm text-gray-600 font-normal">
                              {getTypeDescription(goal.name)}
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Stats Summary */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="font-bold text-lg text-blue-600">
                                {goal.categories?.length || 0}
                              </div>
                              <div className="text-gray-600">Categories</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="font-bold text-lg text-green-600">
                                {goal.totalSubtopics || 0}
                              </div>
                              <div className="text-gray-600">Subtopics</div>
                            </div>
                          </div>

                          {/* Progress Overview */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Overall Progress
                              </span>
                              <span className="text-sm text-gray-600">
                                {goal.completedSubtopics || 0} /{" "}
                                {goal.totalSubtopics || 0}
                              </span>
                            </div>
                            <Progress
                              value={progressPercentage}
                              className="h-3"
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-gray-600">
                                {Math.round(progressPercentage)}% Complete
                              </span>
                              <Badge
                                className={getStatusColor(
                                  goal.completedSubtopics || 0,
                                  goal.totalSubtopics || 0
                                )}
                              >
                                {getStatusText(
                                  goal.completedSubtopics || 0,
                                  goal.totalSubtopics || 0
                                )}
                              </Badge>
                            </div>
                          </div>

                          {/* Categories Preview */}
                          {goal.categories && goal.categories.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Categories:
                              </span>
                              {goal.categories
                                .slice(0, 2)
                                .map((category: GoalCategory) => (
                                  <div
                                    key={category.id}
                                    className="p-2 bg-white dark:bg-gray-700 rounded-md border text-sm"
                                    data-testid={`preview-category-${category.id}`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium truncate">
                                        {category.name}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {category.completedSubtopics || 0}/
                                        {category.totalSubtopics || 0}
                                      </span>
                                    </div>
                                    <Progress
                                      value={
                                        category.totalSubtopics > 0
                                          ? ((category.completedSubtopics ||
                                              0) /
                                              category.totalSubtopics) *
                                            100
                                          : 0
                                      }
                                      className="h-1"
                                    />
                                  </div>
                                ))}
                              {goal.categories.length > 2 && (
                                <div className="text-xs text-gray-500 text-center pt-1">
                                  +{goal.categories.length - 2} more categories
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* --- 3. UPDATED Analytics Overview Section --- */}
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Analytics Overview
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progress by Goal Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Progress by Goal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Use the new chart component with the goals data */}
                      <ApexGoalProgressBarChart goals={sortedGoals} />
                    </CardContent>
                  </Card>

                  {/* Effort Distribution Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Effort Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Use the new chart component with the goals data */}
                      <ApexGoalPieChart goals={sortedGoals} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Import and use the existing GoalHeatMap component for real data */}
        <GoalHeatMap />
      </div>
    </div>
  );
}
