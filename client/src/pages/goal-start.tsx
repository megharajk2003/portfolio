import { useState, useMemo, useCallback } from "react";
import Papa from "papaparse";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Upload, BookOpen, TrendingUp } from "lucide-react";
import GoalHeatMap from "@/components/goal-heat-map";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { navigate } from "wouter/use-browser-location";
import SidebarLayout from "@/components/sidebar-layout";

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
  categoriesCount?: number;
}

// API functions for goals
const fetchUserGoals = async () => {
  const response = await apiRequest("GET", "/api/goals");
  return response.json();
};

const createGoalFromCSVApi = async (data: {
  goalName: string;
  csvData: any[];
}) => {
  const response = await apiRequest("POST", "/api/goals/from-csv", data);
  return response.json();
};

const deleteGoalApi = async (goalId: string) => {
  const response = await apiRequest("DELETE", `/api/goals/${goalId}`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An unexpected error occurred" }));
    throw new Error(errorData.message || "Failed to delete goal");
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
      <div className="h-[300px] flex items-center justify-center text-white-500">
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
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: deleteGoalApi,
    onSuccess: () => {
      toast({ title: "Success!", description: "Goal deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteGoal = (goalId: string) => {
    deleteMutation.mutate(goalId);
  };

  // Use goals directly instead of grouping by type
  const sortedGoals = useMemo(() => {
    return [...goals].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
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
              new Error("CSV must have a header and at least one data row"),
            );
            return;
          }
          // Use PapaParse for proper CSV parsing (handles quoted fields)
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(
                  new Error(
                    `CSV parsing errors: ${results.errors.map((e) => e.message).join(", ")}`,
                  ),
                );
                return;
              }

              const normalizeHeader = (h: string) =>
                h.replace(/^\uFEFF/, "").trim().toLowerCase();
              const fields = (results.meta.fields || []).map(normalizeHeader);
              const required = [
                "category",
                "topics",
                "sub-topics",
                "status",
                "priority",
              ];
              const missing = required.filter((h) => !fields.includes(h));
              if (missing.length > 0) {
                reject(
                  new Error(
                    `Invalid CSV headers. Expected: Category, Topics, Sub-topics, Status, Priority. Missing: ${missing.join(", ")}`,
                  ),
                );
                return;
              }

              if (results.data.length === 0) {
                reject(new Error("CSV is empty or has no valid data rows"));
              } else {
                // Normalize headers to match backend expectations
                const data = results.data.map((row: any) => {
                  const normalizedRow: any = {};
                  const normalizeCell = (value: unknown) => {
                    if (typeof value !== "string") return value;
                    const trimmed = value.replace(/^\uFEFF/, "").trim();
                    if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
                      return trimmed.slice(1, -1).trim();
                    }
                    return trimmed;
                  };
                  Object.keys(row).forEach((key) => {
                    const normalizedKey = key.trim().toLowerCase();
                    const standardKey =
                      normalizedKey === "sub-topics" ||
                      normalizedKey === "subtopic" ||
                      normalizedKey === "sub_topics"
                        ? "sub-topics"
                        : normalizedKey === "topics" ||
                            normalizedKey === "topic"
                          ? "topics"
                          : normalizedKey === "category"
                            ? "category"
                            : normalizedKey === "status"
                              ? "status"
                              : normalizedKey === "priority"
                                ? "priority"
                                : normalizedKey;
                    normalizedRow[standardKey] = normalizeCell(row[key]);
                  });
                  return normalizedRow;
                });
                resolve(data);
              }
            },
            error: (error: Error) => reject(error),
          });
          return; // Stop original logic
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
      await createGoalFromCSVApi({
        goalName: goalName.trim(),
        csvData,
      });
      toast({ title: "Success!", description: "Goal created from CSV" });
      setCsvFile(null);
      setGoalName("");
      window.location.reload();
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (
    completedSubtopics: number,
    totalSubtopics: number,
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
    totalSubtopics: number,
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
    return "📚";
  };

  const getTypeDescription = (type: string) => {
    return "Learning & Preparation";
  };

  if (!user) {
    return (
      <SidebarLayout
        title="Goal Tracker"
        description="Start your learning journey with CSV-based goal tracking"
        contentClassName="max-w-6xl mx-auto space-y-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white-200 rounded w-1/3"></div>
          <div className="h-64 bg-white-200 rounded"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Goal Tracker"
      description="Start your learning journey with CSV-based goal tracking"
      actions={
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
                <p className="text-sm text-white-600 mt-2">
                  CSV must contain columns: Category, Topics, Sub-topics, Status,
                  Priority.
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
      }
      contentClassName="max-w-6xl mx-auto space-y-8"
    >
      {/* Loading state */}
      {goalsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-white-200 rounded w-2/3"></div>
                  <div className="h-4 bg-white-200 rounded w-1/2"></div>
                  <div className="h-20 bg-white-200 rounded"></div>
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
            <h3 className="text-2xl font-semibold text-white-900 dark:text-white-100 mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-white-600 dark:text-white-400 mb-6">
              Upload your first CSV file to begin tracking your preparation
              goals. Support for TNPSC, SSC, UPSC, Banking, and other
              competitive exams.
            </p>
            <div className="text-sm text-white-500 mb-4">
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
                  ? ((goal.completedSubtopics || 0) / goal.totalSubtopics) * 100
                  : 0;

              return (
                <div key={goal.id} className="relative">
                  <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-l-4 border-l-blue-500"
                    onClick={() => navigate(`/goal-tracker/${goal.id}`)}
                    data-testid={`card-goal-${goal.id}`}
                  >
                    <CardHeader className="pb-3 flex-row justify-between items-start">
                      <CardTitle className="flex items-center gap-3">
                        <div className="text-2xl">{getTypeIcon(goal.name)}</div>
                        <div>
                          <div className="text-xl font-bold">{goal.name}</div>
                          <div className="text-sm text-white-600 font-normal">
                            {getTypeDescription(goal.name)}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-white-50 dark:bg-white-800 rounded-lg">
                            <div className="font-bold text-lg text-blue-600">
                              {goal.categories?.length ??
                                goal.categoriesCount ??
                                0}
                            </div>
                            <div className="text-white-600">Categories</div>
                          </div>
                          <div className="text-center p-3 bg-white-50 dark:bg-white-800 rounded-lg">
                            <div className="font-bold text-lg text-green-600">
                              {goal.totalSubtopics || 0}
                            </div>
                            <div className="text-white-600">Subtopics</div>
                          </div>
                        </div>

                        {/* Progress Overview */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Overall Progress
                            </span>
                            <span className="text-sm text-white-600">
                              {goal.completedSubtopics || 0} /{" "}
                              {goal.totalSubtopics || 0}
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className="h-3"
                          />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-white-600">
                              {Math.round(progressPercentage)}% Complete
                            </span>
                            <Badge
                              className={getStatusColor(
                                goal.completedSubtopics || 0,
                                goal.totalSubtopics || 0,
                              )}
                            >
                              {getStatusText(
                                goal.completedSubtopics || 0,
                                goal.totalSubtopics || 0,
                              )}
                            </Badge>
                          </div>
                        </div>

                        {/* Categories Preview */}
                        {goal.categories && goal.categories.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-white-700 dark:text-white-300">
                              Categories:
                            </span>
                            {goal.categories
                              .slice(0, 2)
                              .map((category: GoalCategory) => (
                                <div
                                  key={category.id}
                                  className="p-2 bg-white dark:bg-white-700 rounded-md border text-sm"
                                  data-testid={`preview-category-${category.id}`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium truncate">
                                      {category.name}
                                    </span>
                                    <span className="text-xs text-white-500 ml-2">
                                      {category.completedSubtopics || 0}/
                                      {category.totalSubtopics || 0}
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
                                    className="h-1"
                                  />
                                </div>
                              ))}
                            {goal.categories.length > 2 && (
                              <div className="text-xs text-white-500 text-center pt-1">
                                +{goal.categories.length - 2} more categories
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="absolute top-2 right-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the goal and all of its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={(e) => e.stopPropagation()}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(goal.id);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics Overview Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white-900 dark:text-white-100">
              Analytics Overview
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Progress by Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ApexGoalProgressBarChart goals={sortedGoals} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Effort Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ApexGoalPieChart goals={sortedGoals} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Real data heat map */}
      <GoalHeatMap />
    </SidebarLayout>
  );
}
