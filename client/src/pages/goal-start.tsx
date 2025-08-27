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
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
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

// ApexChart Component for Goal Type Bar Chart
const ApexGoalTypeBarChart: React.FC<{ goalsByType: { [key: string]: Goal[] } }> = ({ goalsByType }) => {
    const chartData = useMemo(() => {
        const data = Object.entries(goalsByType).map(([type, typeGoals]) => {
            const totalSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.totalSubtopics || 0), 0);
            const completedSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.completedSubtopics || 0), 0);
            
            return {
                x: type,
                y: totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0,
                completed: completedSubtopics,
                total: totalSubtopics
            };
        });
        
        return data;
    }, [goalsByType]);

    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: 300,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '60%'
            }
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: chartData.map(item => item.x),
            title: { text: 'Goal Types' }
        },
        yaxis: {
            title: { text: 'Progress Percentage' },
            max: 100,
            min: 0
        },
        fill: { opacity: 1 },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex }) {
                const data = chartData[dataPointIndex];
                return `<div style="padding: 10px;">
                    <strong>${data.x}</strong><br/>
                    Progress: ${data.y}%<br/>
                    Completed: ${data.completed}/${data.total}
                </div>`;
            }
        },
        colors: ['#3b82f6']
    };

    const series = [{
        name: 'Progress %',
        data: chartData.map(item => item.y)
    }];

    return <ReactApexChart options={options} series={series} type="bar" height={300} />;
};

// ApexChart Component for Goal Type Pie Chart
const ApexGoalTypePieChart: React.FC<{ goalsByType: { [key: string]: Goal[] } }> = ({ goalsByType }) => {
    const chartData = useMemo(() => {
        const data = Object.entries(goalsByType).map(([type, typeGoals]) => {
            const completedSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.completedSubtopics || 0), 0);
            return {
                name: type,
                value: completedSubtopics
            };
        });
        
        return data.filter(item => item.value > 0); // Only show types with actual progress
    }, [goalsByType]);

    const options: ApexOptions = {
        chart: {
            type: 'pie',
            height: 300
        },
        labels: chartData.map(item => item.name),
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        tooltip: {
            custom: function({ series, seriesIndex }) {
                const totalForType = Object.values(goalsByType)[seriesIndex]?.reduce((sum, goal) => sum + (goal.totalSubtopics || 0), 0) || 0;
                const completed = series[seriesIndex];
                const percentage = totalForType > 0 ? Math.round((completed / totalForType) * 100) : 0;
                
                return `<div style="padding: 10px;">
                    <strong>${chartData[seriesIndex]?.name}</strong><br/>
                    Completed: ${completed}/${totalForType}<br/>
                    Progress: ${percentage}%
                </div>`;
            }
        },
        legend: {
            position: 'bottom'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { width: 300 },
                legend: { position: 'bottom' }
            }
        }]
    };

    const series = chartData.map(item => item.value);

    if (series.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-500">No completed subtopics yet</div>;
    }

    return <ReactApexChart options={options} series={series} type="pie" height={300} />;
};

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

  // Group goals by type/category for card display
  const goalsByType = useMemo(() => {
    const grouped: { [key: string]: Goal[] } = {};
    goals.forEach((goal: Goal) => {
      // Extract type from goal name (TNPSC, SSC, etc.)
      const goalName = goal.name.toLowerCase();
      let type = "Other";

      if (goalName.includes("tnpsc")) {
        type = "TNPSC";
      } else if (goalName.includes("ssc")) {
        type = "SSC";
      } else if (goalName.includes("upsc")) {
        type = "UPSC";
      } else if (goalName.includes("bank")) {
        type = "Banking";
      }

      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(goal);
    });
    return grouped;
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
    switch (type.toLowerCase()) {
      case "tnpsc":
        return "🏛️";
      case "ssc":
        return "📊";
      case "upsc":
        return "🇮🇳";
      case "banking":
        return "🏦";
      default:
        return "📚";
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type.toLowerCase()) {
      case "tnpsc":
        return "Tamil Nadu Public Service Commission";
      case "ssc":
        return "Staff Selection Commission";
      case "upsc":
        return "Union Public Service Commission";
      case "banking":
        return "Banking & Financial Services";
      default:
        return "General Studies & Preparation";
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

          {/* Goal Type Cards Display */}
          {Object.keys(goalsByType).length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(goalsByType).map(([type, typeGoals]) => {
                  const totalSubtopics = typeGoals.reduce(
                    (sum, goal) => sum + (goal.totalSubtopics || 0),
                    0
                  );
                  const completedSubtopics = typeGoals.reduce(
                    (sum, goal) => sum + (goal.completedSubtopics || 0),
                    0
                  );
                  const progressPercentage =
                    totalSubtopics > 0
                      ? (completedSubtopics / totalSubtopics) * 100
                      : 0;

                  return (
                    <Card
                      key={type}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-l-4 border-l-blue-500"
                      onClick={() =>
                        navigate(
                          `/goal-tracker?type=${encodeURIComponent(type)}`
                        )
                      }
                      data-testid={`card-goal-type-${type.toLowerCase()}`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className="text-2xl">{getTypeIcon(type)}</div>
                          <div>
                            <div className="text-xl font-bold">{type}</div>
                            <div className="text-sm text-gray-600 font-normal">
                              {getTypeDescription(type)}
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
                                {typeGoals.length}
                              </div>
                              <div className="text-gray-600">
                                {typeGoals.length === 1 ? "Goal" : "Goals"}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="font-bold text-lg text-green-600">
                                {totalSubtopics}
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
                                {completedSubtopics} / {totalSubtopics}
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
                                  completedSubtopics,
                                  totalSubtopics
                                )}
                              >
                                {getStatusText(
                                  completedSubtopics,
                                  totalSubtopics
                                )}
                              </Badge>
                            </div>
                          </div>

                          {/* Individual Goals Preview */}
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Goals:
                            </span>
                            {typeGoals.slice(0, 2).map((goal) => (
                              <div
                                key={goal.id}
                                className="p-2 bg-white dark:bg-gray-700 rounded-md border text-sm"
                                data-testid={`preview-goal-${goal.id}`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium truncate">
                                    {goal.name}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {goal.completedSubtopics || 0}/
                                    {goal.totalSubtopics || 0}
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    goal.totalSubtopics > 0
                                      ? ((goal.completedSubtopics || 0) /
                                          goal.totalSubtopics) *
                                        100
                                      : 0
                                  }
                                  className="h-1"
                                />
                              </div>
                            ))}
                            {typeGoals.length > 2 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{typeGoals.length - 2} more goals
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/goal-tracker?type=${encodeURIComponent(type)}`
                              );
                            }}
                            data-testid={`button-view-${type.toLowerCase()}`}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Categories
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Import and use the existing GoalHeatMap component for real data */}
              <GoalHeatMap />

              {/* Progress Summary Charts */}
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Analytics Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progress by Goal Type Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Progress by Goal Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ApexGoalTypeBarChart goalsByType={goalsByType} />
                    </CardContent>
                  </Card>

                  {/* Overall Progress Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Progress Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ApexGoalTypePieChart goalsByType={goalsByType} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
