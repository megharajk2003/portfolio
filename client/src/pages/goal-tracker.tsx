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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { navigate } from "wouter/use-browser-location";

// Get URL search params
const getURLParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    type: urlParams.get('type') || null
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

const createGoalFromCSVApi = async (data: { goalName: string; csvData: any[] }) => {
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
  const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useQuery({
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
      let type = 'Other';
      
      if (goalName.includes('tnpsc')) {
        type = 'TNPSC';
      } else if (goalName.includes('ssc')) {
        type = 'SSC';
      } else if (goalName.includes('upsc')) {
        type = 'UPSC';
      } else if (goalName.includes('bank')) {
        type = 'Banking';
      }
      
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(goal);
    });
    return grouped;
  }, [goals]);

  // Filter goals based on selected type
  const filteredGoals = useMemo(() => {
    if (!selectedGoalType) return goals;
    
    return goals.filter((goal: Goal) => {
      const goalName = goal.name.toLowerCase();
      const type = selectedGoalType.toLowerCase();
      
      if (type === 'tnpsc') return goalName.includes('tnpsc');
      if (type === 'ssc') return goalName.includes('ssc');
      if (type === 'upsc') return goalName.includes('upsc');
      if (type === 'banking') return goalName.includes('bank');
      return type === 'other';
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

  // State for filters
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

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
    if (allCategories.length === 0) return [];
    
    // Create simple progress data for the overall goal
    const dataPoints: ProgressDataPoint[] = [];
    const startDate = new Date(selectedYear, selectedMonth === "all" ? 0 : parseInt(selectedMonth) - 1, 1);
    const endDate = selectedMonth === "all" ? new Date(selectedYear, 11, 31) : new Date(selectedYear, parseInt(selectedMonth), 0);
    
    const current = new Date(startDate);
    let cumulativeCount = 0;

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      
      // Simulate gradual progress over time for all categories combined
      const totalCompleted = allCategories.reduce((sum, cat) => sum + (cat.completedSubtopics || 0), 0);
      const daysSinceStart = Math.floor((current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      cumulativeCount = Math.min(totalCompleted, Math.floor((daysSinceStart / 30) * totalCompleted));
      
      dataPoints.push({ date: dateStr, "Progress": cumulativeCount });
      current.setDate(current.getDate() + 1);
    }
    return dataPoints;
  }, [allCategories, selectedYear, selectedMonth]);

  const getStatusColor = (completedSubtopics: number, totalSubtopics: number) => {
    if (completedSubtopics === totalSubtopics && totalSubtopics > 0) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    } else if (completedSubtopics > 0) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    } else {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    }
  };

  const getStatusText = (completedSubtopics: number, totalSubtopics: number) => {
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
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
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
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedGoalType ? `${selectedGoalType} Categories` : 'All Categories'}
                </h1>
              </div>
              {selectedGoalType && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Viewing categories for {selectedGoalType} goals
                </p>
              )}
            </div>

            {/* CSV Upload Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
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
                      placeholder="e.g., SSC CGL Preparation"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="csvFile">CSV File</Label>
                    <Input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      CSV should contain columns: Category, Topics, Sub-topics, Status.
                    </p>
                  </div>
                  <Button
                    onClick={handleCSVUpload}
                    disabled={isUploading || !csvFile || !goalName.trim()}
                    className="w-full"
                  >
                    {isUploading ? "Uploading..." : "Create Goal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

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
                  Create your first goal by uploading a CSV file or manually adding one.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Goal Type Cards Display */}
          {Object.keys(goalsByType).length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Goal Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(goalsByType).map(([type, typeGoals]) => {
                  const totalSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.totalSubtopics || 0), 0);
                  const completedSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.completedSubtopics || 0), 0);
                  const progressPercentage = totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;
                  
                  return (
                    <Card
                      key={type}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-6 w-6 text-blue-500" />
                          {type}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {typeGoals.length} {typeGoals.length === 1 ? 'goal' : 'goals'}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress Overview */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Overall Progress</span>
                              <span className="text-sm text-gray-600">
                                {completedSubtopics} / {totalSubtopics} Subtopics
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-gray-600">
                                {Math.round(progressPercentage)}% Complete
                              </span>
                              <Badge className={getStatusColor(completedSubtopics, totalSubtopics)}>
                                {getStatusText(completedSubtopics, totalSubtopics)}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Individual Goals */}
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Goals:</span>
                            {typeGoals.map((goal) => (
                              <div 
                                key={goal.id}
                                className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (goal.categories && goal.categories.length > 0) {
                                    navigate(`/goal-tracker/${goal.id}/category/${goal.categories[0].id}`);
                                  }
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{goal.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {goal.completedSubtopics || 0}/{goal.totalSubtopics || 0}
                                  </span>
                                </div>
                                <Progress 
                                  value={
                                    goal.totalSubtopics > 0 
                                      ? ((goal.completedSubtopics || 0) / goal.totalSubtopics) * 100 
                                      : 0
                                  } 
                                  className="h-1 mt-1" 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
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
                    onClick={() => navigate(`/goal-tracker/${category.goalId}/category/${category.id}`)}
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
                              {category.completedSubtopics || 0} / {category.totalSubtopics || 0}{" "}
                              Subtopics
                            </span>
                          </div>
                          <Progress
                            value={
                              category.totalSubtopics > 0
                                ? ((category.completedSubtopics || 0) / category.totalSubtopics) * 100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {category.totalSubtopics > 0
                              ? Math.round(
                                  ((category.completedSubtopics || 0) / category.totalSubtopics) * 100
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

          {/* Goal Type Performance Charts */}
          {Object.keys(goalsByType).length > 0 && (
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
                  <div style={{ width: "100%", height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(goalsByType).map(([type, typeGoals]) => {
                          const totalSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.totalSubtopics || 0), 0);
                          const completedSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.completedSubtopics || 0), 0);
                          return {
                            type,
                            completed: completedSubtopics,
                            total: totalSubtopics,
                            percentage: totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0
                          };
                        })}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="type"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          stroke="#9ca3af"
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          stroke="#9ca3af"
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                          formatter={(value, name) => [
                            name === 'percentage' ? `${value}%` : value,
                            name === 'percentage' ? 'Progress' : 
                            name === 'completed' ? 'Completed' : 'Total'
                          ]}
                        />
                        <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Progress Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Overall Progress Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ width: "100%", height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(goalsByType).map(([type, typeGoals], index) => {
                            const totalSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.totalSubtopics || 0), 0);
                            const completedSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.completedSubtopics || 0), 0);
                            return {
                              name: type,
                              value: completedSubtopics,
                              total: totalSubtopics,
                              color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                            };
                          })}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value, total }) => `${name}: ${value}/${total}`}
                        >
                          {Object.entries(goalsByType).map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                          formatter={(value, name, props) => [
                            `${value}/${props.payload.total} (${Math.round((Number(value) / Number(props.payload.total)) * 100)}%)`,
                            'Completed Subtopics'
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="year-select">Year:</Label>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(v) => setSelectedYear(parseInt(v))}
                      >
                        <SelectTrigger className="w-32" id="year-select">
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
                      <Label htmlFor="month-select">Month:</Label>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="w-40" id="month-select">
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
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: "320px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cumulativeProgressData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        stroke="#9ca3af"
                        domain={[0, "dataMax + 2"]}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="stepAfter"
                        dataKey="Progress"
                        stroke={GOAL_COLOR}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}