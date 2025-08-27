import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, TrendingUp } from "lucide-react";
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

// 1. NEW Interfaces for the Category -> Topic hierarchy
interface Topic {
  id: string;
  name: string;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  completedSubtopicTimestamps: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
}

interface ProgressDataPoint {
  date: string;
  [key: string]: number | string;
}

const CATEGORY_COLOR = "#3b82f6"; // Blue for the single category line

// 2. NEW Dummy Data Structure
const dummyCategory: Category = {
  id: "cat-ssc-cgl-01",
  name: "SSC CGL Preparation",
  description: "Overall preparation for the SSC CGL examination.",
  totalTopics: 4,
  completedTopics: 0,
  totalSubtopics: 85, // 31 + 16 + 23 + 15
  completedSubtopics: 10, // 0 + 5 + 2 + 3
  createdAt: "2025-06-01T10:00:00.000Z",
  updatedAt: "2025-08-27T12:00:00.000Z",
  topics: [
    {
      id: "421f836b-aea4-46d9-ba6b-c11d2e200a65",
      name: "General Intelligence & Reasoning",
      totalSubtopics: 31,
      completedSubtopics: 0,
      createdAt: "2025-06-01T10:00:00.000Z",
      completedSubtopicTimestamps: [],
    },
    {
      id: "d02c952f-aff7-4112-a2fa-b81a96182970",
      name: "General Awareness",
      totalSubtopics: 16,
      completedSubtopics: 5,
      createdAt: "2025-06-15T10:00:00.000Z",
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
      name: "Quantitative Aptitude",
      totalSubtopics: 23,
      completedSubtopics: 2,
      createdAt: "2025-07-01T09:00:00.000Z",
      completedSubtopicTimestamps: [
        "2025-07-20T15:30:00.000Z",
        "2025-08-10T10:00:00.000Z",
      ],
    },
    {
      id: "8c77d1fc-42e7-47b5-b425-91e66e0436a8",
      name: "English Comprehension",
      totalSubtopics: 15,
      completedSubtopics: 3,
      createdAt: "2025-07-10T10:00:00.000Z",
      completedSubtopicTimestamps: [
        "2025-08-05T12:00:00.000Z",
        "2025-08-20T16:00:00.000Z",
        "2025-08-21T17:00:00.000Z",
      ],
    },
  ],
};

export default function CategoryTracker() {
  const category = dummyCategory; // Use the dummy data
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

  // 3. UPDATED Graph logic to aggregate all topic data
  const cumulativeProgressData = useMemo(() => {
    // Flatten all completion timestamps from all topics into one array
    const allTimestamps = category.topics.flatMap(
      (topic) => topic.completedSubtopicTimestamps
    );

    // Create a map of completions per day for the entire category
    const completionsByDay = new Map<string, number>();
    allTimestamps.forEach((timestamp) => {
      const dateKey = new Date(timestamp).toISOString().split("T")[0];
      completionsByDay.set(dateKey, (completionsByDay.get(dateKey) || 0) + 1);
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

    const dataPoints: ProgressDataPoint[] = [];
    const current = new Date(startDate);
    let cumulativeCount = 0;

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      const dateKey = current.toISOString().split("T")[0];

      if (completionsByDay.has(dateKey)) {
        cumulativeCount += completionsByDay.get(dateKey)!;
      }

      // Only start plotting after the category was created
      if (current >= new Date(category.createdAt)) {
        dataPoints.push({
          date: dateStr,
          [category.name]: cumulativeCount,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return dataPoints;
  }, [category, selectedYear, selectedMonth]);

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

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Category Tracker
            </h1>
          </div>

          {/* Category Overview Card */}
          <Card>
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
                      (category.completedSubtopics / category.totalSubtopics) *
                      100
                    }
                    className="h-2"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {category.totalSubtopics > 0
                      ? Math.round(
                          (category.completedSubtopics /
                            category.totalSubtopics) *
                            100
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

          {/* Study Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Category Performance
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
                      stroke={CATEGORY_COLOR}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
