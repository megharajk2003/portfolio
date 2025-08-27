import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
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

// Interfaces for the Category -> Topic hierarchy
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

const CATEGORY_COLOR = "#3b82f6";

// Dummy Data Structure
const dummyCategory: Category = {
  id: "cat-ssc-cgl-01",
  name: "SSC CGL Preparation",
  description: "Overall preparation for the SSC CGL examination.",
  totalTopics: 4,
  completedTopics: 0,
  totalSubtopics: 85,
  completedSubtopics: 10,
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
  const category = dummyCategory; // In a real app, you'd fetch this data
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  // State for filters
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // === START: ADDED CSV UPLOAD LOGIC ===
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // CSV upload mutation (assumes an endpoint like `/api/categories/from-csv`)
  const csvUploadMutation = useMutation({
    mutationFn: async (data: { categoryName: string; csvData: any[] }) => {
      const response = await fetch("/api/categories/from-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Category created from CSV" });
      // In a real app, this would refetch the category data
      // queryClient.invalidateQueries({ queryKey: ["/api/category"] });
      setCsvFile(null);
      setCategoryName("");
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
    if (!csvFile || !categoryName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a category name",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    try {
      const csvData = await parseCSV(csvFile);
      await csvUploadMutation.mutateAsync({
        categoryName: categoryName.trim(),
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
  // === END: ADDED CSV UPLOAD LOGIC ===

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
    const allTimestamps = category.topics.flatMap(
      (topic) => topic.completedSubtopicTimestamps
    );
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
      if (current >= new Date(category.createdAt)) {
        dataPoints.push({ date: dateStr, [category.name]: cumulativeCount });
      }
      current.setDate(current.getDate() + 1);
    }
    return dataPoints;
  }, [category, selectedYear, selectedMonth]);

  const getStatusColor = (status: string) => {
    /* ... (no changes) */
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

            {/* === START: ADDED UPLOAD BUTTON & DIALOG JSX === */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" /> Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Category from CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      placeholder="e.g., SSC CGL Preparation"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
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
                      CSV should contain columns: Topic, Subtopic, Status.
                    </p>
                  </div>
                  <Button
                    onClick={handleCSVUpload}
                    disabled={isUploading || !csvFile || !categoryName.trim()}
                    className="w-full"
                  >
                    {isUploading ? "Uploading..." : "Create Category"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* === END: ADDED UPLOAD BUTTON & DIALOG JSX === */}
          </div>

          {/* Category Overview Card */}
          <Card
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => navigate(`/goal-tracker/id}`)}
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
