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
import { Target, TrendingUp, Upload } from "lucide-react";
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
} from "recharts";
import { navigate } from "wouter/use-browser-location";

// Interfaces for the Goal tracking system
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

  // Fetch user goals
  const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchUserGoals,
    enabled: !!user,
  });

  // For now, show the first goal or create a placeholder
  const firstGoal = goals[0];
  const category = firstGoal ? {
    id: firstGoal.id,
    name: firstGoal.name,
    description: firstGoal.description || '',
    totalTopics: firstGoal.totalTopics || 0,
    completedTopics: firstGoal.completedTopics || 0,
    totalSubtopics: firstGoal.totalSubtopics || 0,
    completedSubtopics: firstGoal.completedSubtopics || 0,
    createdAt: firstGoal.createdAt,
    updatedAt: firstGoal.updatedAt,
  } : null;

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
    if (!category) return [];
    
    // Create simple progress data based on the goal's completion
    const dataPoints: ProgressDataPoint[] = [];
    const startDate = new Date(selectedYear, selectedMonth === "all" ? 0 : parseInt(selectedMonth) - 1, 1);
    const endDate = selectedMonth === "all" ? new Date(selectedYear, 11, 31) : new Date(selectedYear, parseInt(selectedMonth), 0);
    
    const current = new Date(startDate);
    let cumulativeCount = 0;
    const maxProgress = category.totalSubtopics;
    const currentProgress = category.completedSubtopics;

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      
      // Simulate gradual progress over time
      const daysSinceStart = Math.floor((current.getTime() - new Date(category.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart >= 0) {
        cumulativeCount = Math.min(currentProgress, Math.floor((daysSinceStart / 30) * currentProgress));
      }
      
      if (current >= new Date(category.createdAt)) {
        dataPoints.push({ date: dateStr, [category.name]: cumulativeCount });
      }
      current.setDate(current.getDate() + 1);
    }
    return dataPoints;
  }, [category, selectedYear, selectedMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Goal Tracker
            </h1>

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

          {/* Goal Overview Card */}
          {category && (
            <Card
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => navigate(`/goal-details/${category.id}`)}
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
                        {category.completedSubtopics} / {category.totalSubtopics}{" "}
                        Subtopics
                      </span>
                    </div>
                    <Progress
                      value={
                        category.totalSubtopics > 0
                          ? (category.completedSubtopics / category.totalSubtopics) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {category.totalSubtopics > 0
                        ? Math.round(
                            (category.completedSubtopics / category.totalSubtopics) * 100
                          )
                        : 0}
                      % Complete
                    </span>
                    <Badge
                      className={getStatusColor(
                        category.completedSubtopics === category.totalSubtopics
                          ? "completed"
                          : category.completedSubtopics > 0
                          ? "in_progress"
                          : "pending"
                      )}
                    >
                      {category.completedSubtopics === category.totalSubtopics
                        ? "Completed"
                        : category.completedSubtopics > 0
                        ? "In Progress"
                        : "Not Started"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Performance Chart */}
          {category && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Goal Performance
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
                        dataKey={category.name}
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