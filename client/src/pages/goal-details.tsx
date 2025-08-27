import { useState, useMemo } from "react";
// tanstack/react-query is not needed for this dummy data setup
// import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Upload, Target, FileSpreadsheet, TrendingUp } from "lucide-react";
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

// 1. UPDATED Goal interface to include timestamps for the graph
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
  completedSubtopicTimestamps: string[]; // <-- ADDED FOR ACCURATE GRAPH
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

// 2. DUMMY DATA to test the component and graph
const dummyGoals: Goal[] = [
  {
    id: "421f836b-aea4-46d9-ba6b-c11d2e200a65",
    userId: 4,
    name: "General Intelligence & Reasoning",
    totalTopics: 1,
    completedTopics: 0,
    totalSubtopics: 31,
    completedSubtopics: 0,
    createdAt: "2025-06-01T10:00:00.000Z",
    updatedAt: "2025-08-27T12:00:00.000Z",
    completedSubtopicTimestamps: [],
  },
  {
    id: "d02c952f-aff7-4112-a2fa-b81a96182970",
    userId: 4,
    name: "General Awareness",
    totalTopics: 1,
    completedTopics: 0,
    totalSubtopics: 16,
    completedSubtopics: 5,
    createdAt: "2025-06-15T10:00:00.000Z",
    updatedAt: "2025-08-27T12:00:00.000Z",
    completedSubtopicTimestamps: [
      "2025-07-05T11:00:00.000Z",
      "2025-07-06T11:00:00.000Z",
      "2025-08-01T14:20:00.000Z",
      "2025-08-02T09:00:00.000Z",
      "2025-08-15T18:00:00.000Z",
    ],
  },
  {
    id: "a2a30053-6aa5-4c06-93e1-b3612b246d7f",
    userId: 4,
    name: "Quantitative Aptitude",
    totalTopics: 1,
    completedTopics: 0,
    totalSubtopics: 23,
    completedSubtopics: 2,
    createdAt: "2025-07-01T09:00:00.000Z",
    updatedAt: "2025-08-27T12:00:00.000Z",
    completedSubtopicTimestamps: [
      "2025-07-20T15:30:00.000Z", // Ratio and Proportion
      "2025-08-10T10:00:00.000Z", // Time and Distance
    ],
  },
  {
    id: "8c77d1fc-42e7-47b5-b425-91e66e0436a8",
    userId: 4,
    name: "English Comprehension",
    totalTopics: 1,
    completedTopics: 0,
    totalSubtopics: 15,
    completedSubtopics: 3,
    createdAt: "2025-07-10T10:00:00.000Z",
    updatedAt: "2025-08-27T12:00:00.000Z",
    completedSubtopicTimestamps: [
      "2025-08-05T12:00:00.000Z",
      "2025-08-20T16:00:00.000Z",
      "2025-08-21T17:00:00.000Z",
    ],
  },
];

export default function GoalTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [goalName, setGoalName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [, navigate] = useLocation();

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

  const goals = dummyGoals;
  const goalsLoading = false;

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

  // FIX: MOVED filteredGoals calculation to its own useMemo hook
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const goalCreated = new Date(goal.createdAt);
      const goalUpdated = new Date(goal.updatedAt);

      let periodStart, periodEnd;

      if (selectedMonth === "all") {
        periodStart = new Date(selectedYear, 0, 1);
        periodEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
      } else {
        const monthIndex = parseInt(selectedMonth) - 1;
        periodStart = new Date(selectedYear, monthIndex, 1);
        periodEnd = new Date(selectedYear, monthIndex + 1, 0, 23, 59, 59);
      }

      return goalCreated <= periodEnd && goalUpdated >= periodStart;
    });
  }, [goals, selectedYear, selectedMonth]);

  const cumulativeProgressData = useMemo(() => {
    // Now it uses the filteredGoals from the component scope
    if (!filteredGoals.length) return [];

    const completionsByDay = new Map<string, Map<string, number>>();
    filteredGoals.forEach((goal) => {
      const goalCompletions = new Map<string, number>();
      if (goal.completedSubtopicTimestamps) {
        goal.completedSubtopicTimestamps.forEach((timestamp) => {
          const dateKey = new Date(timestamp).toISOString().split("T")[0];
          goalCompletions.set(dateKey, (goalCompletions.get(dateKey) || 0) + 1);
        });
      }
      completionsByDay.set(goal.id, goalCompletions);
    });

    let startDate, endDate;
    if (selectedMonth === "all") {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    } else {
      const monthIndex = parseInt(selectedMonth) - 1;
      startDate = new Date(selectedYear, monthIndex, 1);
      endDate = new Date(selectedYear, monthIndex + 1, 0);
    }

    const dataPoints: GoalProgressData[] = [];
    const current = new Date(startDate);
    const cumulativeCounts = new Map<string, number>();
    filteredGoals.forEach((goal) => cumulativeCounts.set(goal.name, 0));

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      const dateKey = current.toISOString().split("T")[0];

      const progressPoint: GoalProgressData = { date: dateStr };

      filteredGoals.forEach((goal) => {
        const goalCreatedDate = new Date(goal.createdAt);
        if (current >= goalCreatedDate) {
          const goalCompletions = completionsByDay.get(goal.id);
          let currentCumulative = cumulativeCounts.get(goal.name) || 0;

          if (goalCompletions && goalCompletions.has(dateKey)) {
            currentCumulative += goalCompletions.get(dateKey)!;
            cumulativeCounts.set(goal.name, currentCumulative);
          }
          progressPoint[goal.name] = currentCumulative;
        } else {
          progressPoint[goal.name] = 0;
        }
      });

      dataPoints.push(progressPoint);
      current.setDate(current.getDate() + 1);
    }

    return dataPoints;
    // FIX: Added filteredGoals to dependency array
  }, [filteredGoals, selectedYear, selectedMonth]);

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
          </div>

          {goalsLoading ? (
            <div className="text-center py-8"> /* ... */ </div>
          ) : goals.length === 0 ? (
            <Card> /* ... */ </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => navigate(`/goal-tracker/id/subtopic`)}
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
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {goal.totalSubtopics > 0
                            ? Math.round(
                                (goal.completedSubtopics /
                                  goal.totalSubtopics) *
                                  100
                              )
                            : 0}
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

          {goals.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Study Performance
                  </CardTitle>
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
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      {/* This now works correctly */}
                      {filteredGoals.map((goal, index) => (
                        <Line
                          key={goal.id}
                          type="stepAfter"
                          dataKey={goal.name}
                          stroke={GOAL_COLORS[index % GOAL_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
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
