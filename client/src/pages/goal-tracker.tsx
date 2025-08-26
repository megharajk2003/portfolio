import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
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
import {
  Upload,
  Target,
  FileSpreadsheet,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useLocation } from "wouter";
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

interface Goal {
  id: string;
  userId: number;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalProgressData {
  date: string;
  [goalName: string]: number | string;
}

const GOAL_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export default function GoalTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [goalName, setGoalName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [, navigate] = useLocation();

  // Filter states
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

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

  // Fetch user's goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });


  // CSV upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: async (data: { goalName: string; csvData: any[] }) => {
      const response = await fetch("/api/goals/from-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create goal");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Goal created successfully from CSV data",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setCsvFile(null);
      setGoalName("");
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to create goal from CSV",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "start":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());

          if (lines.length < 2) {
            reject(
              new Error("CSV must have at least a header row and one data row")
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
        description: "Please select a CSV file and enter a goal name",
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

  // Generate cumulative progress data for the line chart based on real dates
  const cumulativeProgressData = useMemo(() => {
    if (!goals.length) return [];

    // Filter goals based on selected year and month
    const filteredGoals = goals.filter((goal) => {
      const goalDate = new Date(goal.createdAt);
      const goalYear = goalDate.getFullYear();
      const goalMonth = String(goalDate.getMonth() + 1).padStart(2, "0");

      const yearMatch = goalYear <= selectedYear;
      const monthMatch = selectedMonth === "all" || goalMonth === selectedMonth;

      return (
        yearMatch &&
        (selectedMonth === "all" || goalYear === selectedYear) &&
        monthMatch
      );
    });

    if (!filteredGoals.length) return [];

    // Generate date range based on selected filters
    let startDate: Date;
    let endDate: Date;

    if (selectedMonth === "all") {
      // Show full year
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    } else {
      // Show specific month
      const monthIndex = parseInt(selectedMonth) - 1;
      startDate = new Date(selectedYear, monthIndex, 1);
      endDate = new Date(selectedYear, monthIndex + 1, 0);
    }

    const dataPoints: GoalProgressData[] = [];
    const current = new Date(startDate);

    // Generate data points - daily for specific month, weekly for full year
    const isMonthView = selectedMonth !== "all";
    const intervalDays = isMonthView ? 1 : 7; // Daily for month, weekly for year

    while (current <= endDate) {
      const dateStr = isMonthView
        ? current.toLocaleDateString("en-US", { day: "2-digit" })
        : current.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          });

      const progressPoint: GoalProgressData = { date: dateStr };

      filteredGoals.forEach((goal) => {
        const goalCreated = new Date(goal.createdAt);
        const goalUpdated = new Date(goal.updatedAt);

        if (current >= goalCreated) {
          // Calculate actual progress based on time elapsed
          const totalTimespan = goalUpdated.getTime() - goalCreated.getTime();
          const currentTimespan = current.getTime() - goalCreated.getTime();

          let cumulativeProgress = 0;
          if (totalTimespan > 0) {
            const progressRatio = Math.min(currentTimespan / totalTimespan, 1);
            cumulativeProgress = Math.floor(
              goal.completedSubtopics * progressRatio
            );
          } else if (current >= goalUpdated) {
            cumulativeProgress = goal.completedSubtopics;
          }

          progressPoint[goal.name] = Math.max(0, cumulativeProgress);
        } else {
          progressPoint[goal.name] = 0;
        }
      });

      dataPoints.push(progressPoint);
      current.setDate(current.getDate() + intervalDays);
    }

    return dataPoints;
  }, [goals, selectedYear, selectedMonth]);

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div
          className="container mx-auto p-6 space-y-6"
          data-testid="goal-tracker-page"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900 dark:text-gray-100  dark:text-white"
                data-testid="page-title"
              >
                Goal Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Upload CSV files and track your progress with interactive
                visualizations
              </p>
            </div>

            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-upload-csv">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-upload-csv">
                  <DialogHeader>
                    <DialogTitle>Upload Goal from CSV</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goalName">Goal Name</Label>
                      <Input
                        id="goalName"
                        placeholder="Enter a name for your goal"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        data-testid="input-goal-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="csvFile">CSV File</Label>
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={(e) =>
                          setCsvFile(e.target.files?.[0] || null)
                        }
                        data-testid="input-csv-file"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        CSV should contain columns: Category, Topic, Status
                      </p>
                    </div>

                    <Button
                      onClick={handleCSVUpload}
                      disabled={isUploading || !csvFile || !goalName.trim()}
                      className="w-full"
                      data-testid="button-submit-csv"
                    >
                      {isUploading ? "Uploading..." : "Create Goal"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Goals Overview */}
          {goalsLoading ? (
            <div className="text-center py-8" data-testid="loading-goals">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading your goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <Card data-testid="empty-state">
              <CardContent className="text-center py-12">
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No goals yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload a CSV file to create your first goal and start tracking
                  your progress
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => navigate(`/goal-tracker/${goal.id}`)}
                  data-testid={`card-goal-${goal.id}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      {goal.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">
                            {goal.completedSubtopics} / {goal.totalSubtopics}
                          </span>
                        </div>
                        <Progress
                          value={
                            (goal.completedSubtopics / goal.totalSubtopics) *
                            100
                          }
                          className="h-2"
                          data-testid={`progress-goal-${goal.id}`}
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {Math.round(
                            (goal.completedSubtopics / goal.totalSubtopics) *
                              100
                          )}
                          % Complete
                        </span>
                        <Badge
                          className={getStatusColor(
                            goal.completedSubtopics === goal.totalSubtopics
                              ? "completed"
                              : goal.completedSubtopics > 0
                              ? "in_progress"
                              : "pending"
                          )}
                        >
                          {goal.completedSubtopics === goal.totalSubtopics
                            ? "Completed"
                            : goal.completedSubtopics > 0
                            ? "In Progress"
                            : "Not Started"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters */}

          {/* Study Performance Chart */}
          {goals.length > 0 && (
            <Card>
              <CardHeader>
                {/* Flex container to position title and filters on the same line */}
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Study Performance
                  </CardTitle>

                  {/* Filters are now here */}
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="year-select">Year:</Label>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) =>
                          setSelectedYear(parseInt(value))
                        }
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
                <div style={{ width: "100%", height: "320px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cumulativeProgressData}
                      margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        stroke="#9ca3af"
                        domain={[0, "dataMax + 2"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      {goals.map((goal, index) => (
                        <Line
                          key={goal.id}
                          type="monotone"
                          dataKey={goal.name}
                          stroke={GOAL_COLORS[index % GOAL_COLORS.length]}
                          strokeWidth={2}
                          dot={{
                            r: 3,
                            fill: GOAL_COLORS[index % GOAL_COLORS.length],
                          }}
                          activeDot={{
                            r: 5,
                            fill: GOAL_COLORS[index % GOAL_COLORS.length],
                          }}
                        />
                      ))}
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
