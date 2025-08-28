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
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
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

  // Filter goals based on selected type
  const filteredGoals = useMemo(() => {
    if (!selectedGoalType) return goals;

    return goals.filter((goal: Goal) => {
      const goalName = goal.name.toLowerCase();
      const type = selectedGoalType.toLowerCase();

      if (type === "tnpsc") return goalName.includes("tnpsc");
      if (type === "ssc") return goalName.includes("ssc");
      if (type === "upsc") return goalName.includes("upsc");
      if (type === "banking") return goalName.includes("bank");
      return type === "other";
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

// ApexChart Component for Category Progress
const ApexProgressChart: React.FC<{ categories: GoalCategory[] }> = ({ categories }) => {
    
    const chartState = useMemo(() => {
        // Check if we have real completion timestamp data
        const hasRealData = categories.some(category => 
            category.completedSubtopicTimestamps && category.completedSubtopicTimestamps.length > 0
        );
        
        if (!hasRealData) {
            // Generate sample data based on current completion status for demo
            const series = categories.map(category => ({
                name: category.name,
                data: [] as [number, number][],
            }));
            
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 14); // 14 days ago
            
            // Generate realistic progress over the last 14 days
            for (let i = 0; i <= 14; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                const timestamp = currentDate.getTime();
                
                categories.forEach((category, categoryIndex) => {
                    const completedSubtopics = category.completedSubtopics || 0;
                    let progress = 0;
                    
                    // Show gradual progress buildup over time
                    if (completedSubtopics > 0) {
                        // Show more recent progress
                        if (i >= 10) {
                            progress = Math.min(completedSubtopics, Math.floor(completedSubtopics * ((i - 9) / 5)));
                        }
                    }
                    
                    const seriesIndex = series.findIndex(s => s.name === category.name);
                    series[seriesIndex].data.push([timestamp, Math.max(0, progress)]);
                });
            }
            
            return { series };
        }

        // Use real completion timestamp data
        const validCategories = categories.filter(cat => cat && cat.name);
        const series = validCategories.map(category => ({
            name: category.name,
            data: [] as [number, number][],
        }));

        const allTimestamps = validCategories.flatMap(cat => 
            (cat.completedSubtopicTimestamps || []).map(ts => ({
                catName: cat.name,
                timestamp: new Date(ts),
            }))
        ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        const cumulativeCounts: { [key: string]: number } = {};
        validCategories.forEach(cat => (cumulativeCounts[cat.name] = 0));
        
        // Add a starting point for each series at its creation date
        validCategories.forEach(cat => {
            const seriesIndex = series.findIndex(s => s.name === cat.name);
            if (seriesIndex > -1 && cat.createdAt) {
                const startDate = new Date(cat.createdAt).getTime();
                series[seriesIndex].data.push([startDate, 0]);
            }
        });

        // Build the incremental, cumulative data points
        allTimestamps.forEach(({ catName, timestamp }) => {
            cumulativeCounts[catName]++;
            const seriesIndex = series.findIndex(s => s.name === catName);
            if (seriesIndex > -1) {
                series[seriesIndex].data.push([timestamp.getTime(), cumulativeCounts[catName]]);
            }
        });
        
        // Ensure all lines extend to the final timestamp for a clean graph
        if (allTimestamps.length > 0) {
            const lastTimestamp = allTimestamps[allTimestamps.length - 1].timestamp.getTime();
            series.forEach(s => {
                if (s.data.length > 0 && s.data[s.data.length - 1][0] < lastTimestamp) {
                    s.data.push([lastTimestamp, s.data[s.data.length - 1][1]]);
                }
            });
        }

        return { series };
    }, [categories]);
    
    // Options object adapted from your template
    const options: ApexOptions = {
        chart: {
            type: 'area',
            stacked: false,
            height: 350,
            zoom: { type: 'x', enabled: true, autoScaleYaxis: true },
            toolbar: { autoSelected: 'zoom' },
        },
        dataLabels: { enabled: false },
        markers: { size: 0 },
        title: {
            text: 'Category Progress Over Time',
            align: 'left'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            },
        },
        yaxis: {
            title: { text: 'Subtopics Completed' },
            labels: { formatter: (val) => val.toFixed(0) },
        },
        xaxis: { type: 'datetime' },
        tooltip: {
            shared: false,
            y: { formatter: (val) => val.toFixed(0) }
        },
        stroke: { curve: 'stepline' } // Use 'stepline' to show incremental progress accurately
    };

    return (
        <div>
            <div id="chart">
                <ReactApexChart options={options} series={chartState.series} type="area" height={350} />
            </div>
        </div>
    );
};

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

// ApexChart Component for Calendar Heat Map
const ApexCalendarHeatMap: React.FC<{ goals: Goal[] }> = ({ goals }) => {
    const heatMapData = useMemo(() => {
        // Generate heat map data for the current year
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);
        
        // Create an array of dates for the year
        const dates: { x: number; y: number }[] = [];
        const current = new Date(startDate);
        
        while (current <= endDate) {
            dates.push({
                x: current.getTime(),
                y: 0 // Start with 0 completions
            });
            current.setDate(current.getDate() + 1);
        }
        
        // Process goals to add completion data
        goals.forEach(goal => {
            if (goal.categories) {
                goal.categories.forEach(category => {
                    if (category.completedSubtopicTimestamps) {
                        category.completedSubtopicTimestamps.forEach(timestamp => {
                            const date = new Date(timestamp);
                            if (date.getFullYear() === currentYear) {
                                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                const dateIndex = dates.findIndex(d => d.x === dayStart.getTime());
                                if (dateIndex >= 0) {
                                    dates[dateIndex].y += 1;
                                }
                            }
                        });
                    }
                });
            }
        });
        
        return dates;
    }, [goals]);

    const options: ApexOptions = {
        chart: {
            type: 'heatmap',
            height: 200,
            toolbar: { show: false }
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 0,
                useFillColorAsStroke: true,
                colorScale: {
                    ranges: [
                        { from: 0, to: 0, name: 'No activity', color: '#f3f4f6' },
                        { from: 1, to: 2, name: 'Low', color: '#ddd6fe' },
                        { from: 3, to: 5, name: 'Medium', color: '#a5b4fc' },
                        { from: 6, to: 10, name: 'High', color: '#6366f1' },
                        { from: 11, to: 999, name: 'Very High', color: '#4338ca' }
                    ]
                }
            }
        },
        dataLabels: { enabled: false },
        stroke: { width: 1 },
        title: {
            text: 'Daily Study Activity Heat Map',
            align: 'left'
        },
        xaxis: {
            type: 'datetime',
            labels: {
                format: 'MMM'
            }
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const data = heatMapData[dataPointIndex];
                const date = new Date(data.x).toDateString();
                return `<div style="padding: 10px;">
                    <strong>${date}</strong><br/>
                    Subtopics completed: ${data.y}
                </div>`;
            }
        }
    };

    const series = [{
        name: 'Subtopics Completed',
        data: heatMapData
    }];

    return <ReactApexChart options={options} series={series} type="heatmap" height={200} />;
};

// ApexChart Component for Radar Chart
const ApexRadarChart: React.FC<{ goalsByType: { [key: string]: Goal[] } }> = ({ goalsByType }) => {
    const radarData = useMemo(() => {
        return Object.entries(goalsByType).map(([type, typeGoals]) => {
            const totalSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.totalSubtopics || 0), 0);
            const completedSubtopics = typeGoals.reduce((sum, goal) => sum + (goal.completedSubtopics || 0), 0);
            
            return {
                category: type,
                percentage: totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0
            };
        });
    }, [goalsByType]);

    const options: ApexOptions = {
        chart: {
            type: 'radar',
            height: 350,
            toolbar: { show: false }
        },
        title: {
            text: 'Subject Proficiency Balance',
            align: 'left'
        },
        xaxis: {
            categories: radarData.map(item => item.category)
        },
        yaxis: {
            stepSize: 20,
            max: 100,
            min: 0,
            labels: {
                formatter: (val) => `${val}%`
            }
        },
        plotOptions: {
            radar: {
                size: 140,
                polygons: {
                    strokeColors: '#e9e9e9',
                    fill: {
                        colors: ['#f8f9fa', '#e9ecef']
                    }
                }
            }
        },
        colors: ['#3b82f6'],
        markers: {
            size: 4,
            colors: ['#3b82f6'],
            strokeColors: '#fff',
            strokeWidth: 2,
        },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex }) {
                const data = radarData[dataPointIndex];
                return `<div style="padding: 10px;">
                    <strong>${data.category}</strong><br/>
                    Progress: ${data.percentage}%
                </div>`;
            }
        },
        fill: {
            opacity: 0.1
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['#3b82f6'],
            dashArray: 0
        }
    };

    const series = [{
        name: 'Progress %',
        data: radarData.map(item => item.percentage)
    }];

    return <ReactApexChart options={options} series={series} type="radar" height={350} />;
};

// ApexChart Component for Treemap
const ApexTreemapChart: React.FC<{ allCategories: GoalCategory[] }> = ({ allCategories }) => {
    const treemapData = useMemo(() => {
        return allCategories.map(category => {
            const completionRate = category.totalSubtopics > 0 
                ? (category.completedSubtopics || 0) / category.totalSubtopics 
                : 0;
            
            return {
                x: category.name,
                y: category.totalSubtopics || 1, // Size based on total subtopics
                fillColor: completionRate === 1 ? '#10b981' : completionRate > 0 ? '#3b82f6' : '#f59e0b'
            };
        });
    }, [allCategories]);

    const options: ApexOptions = {
        chart: {
            type: 'treemap',
            height: 400,
            toolbar: { show: false }
        },
        title: {
            text: 'Topic Structure Overview',
            align: 'left'
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
                colors: ['#fff']
            },
            formatter: function(text: string, op: any): string | string[] {
                const category = allCategories.find(cat => cat.name === text);
                if (category) {
                    return [text, `${category.completedSubtopics}/${category.totalSubtopics}`];
                }
                return text;
            },
            offsetY: -4
        },
        plotOptions: {
            treemap: {
                enableShades: true,
                shadeIntensity: 0.5,
                reverseNegativeShade: true,
                colorScale: {
                    ranges: [
                        { from: -1, to: 0, color: '#f59e0b' }, // Not started - yellow
                        { from: 0.01, to: 0.99, color: '#3b82f6' }, // In progress - blue  
                        { from: 1, to: 1, color: '#10b981' } // Completed - green
                    ]
                }
            }
        },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const category = allCategories[dataPointIndex];
                const completionRate = category.totalSubtopics > 0 
                    ? Math.round((category.completedSubtopics || 0) / category.totalSubtopics * 100) 
                    : 0;
                
                let status = 'Not Started';
                if (completionRate === 100) status = 'Completed';
                else if (completionRate > 0) status = 'In Progress';
                
                return `<div style="padding: 10px;">
                    <strong>${category.name}</strong><br/>
                    Progress: ${category.completedSubtopics || 0}/${category.totalSubtopics || 0} (${completionRate}%)<br/>
                    Status: ${status}
                </div>`;
            }
        }
    };

    const series = [{
        data: treemapData
    }];

    if (treemapData.length === 0) {
        return <div className="h-[400px] flex items-center justify-center text-gray-500">No categories available</div>;
    }

    return <ReactApexChart options={options} series={series} type="treemap" height={400} />;
};

  const cumulativeProgressData = useMemo(() => {
    if (allCategories.length === 0) return [];

    // Create simple progress data for the overall goal
    const dataPoints: ProgressDataPoint[] = [];
    const startDate = new Date(
      selectedYear,
      selectedMonth === "all" ? 0 : parseInt(selectedMonth) - 1,
      1
    );
    const endDate =
      selectedMonth === "all"
        ? new Date(selectedYear, 11, 31)
        : new Date(selectedYear, parseInt(selectedMonth), 0);

    const current = new Date(startDate);
    let cumulativeCount = 0;

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

      // Simulate gradual progress over time for all categories combined
      const totalCompleted = allCategories.reduce(
        (sum, cat) => sum + (cat.completedSubtopics || 0),
        0
      );
      const daysSinceStart = Math.floor(
        (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      cumulativeCount = Math.min(
        totalCompleted,
        Math.floor((daysSinceStart / 30) * totalCompleted)
      );

      dataPoints.push({ date: dateStr, Progress: cumulativeCount });
      current.setDate(current.getDate() + 1);
    }
    return dataPoints;
  }, [allCategories, selectedYear, selectedMonth]);

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
                  <ApexGoalTypeBarChart goalsByType={goalsByType} />
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
                  <ApexGoalTypePieChart goalsByType={goalsByType} />
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
                {/* Render the new ApexChart component instead of the Recharts one */}
                <ApexProgressChart categories={allCategories} />
              </CardContent>
            </Card>
          )}

          {/* New Enhanced Visualization Charts */}
          {goals.length > 0 && (
            <div className="space-y-6">
              {/* Calendar Heat Map */}
              <Card data-testid="calendar-heat-map">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Daily Study Activity Heat Map
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GitHub-style heat map showing your daily consistency and study habits
                  </p>
                </CardHeader>
                <CardContent>
                  <ApexCalendarHeatMap goals={filteredGoals} />
                </CardContent>
              </Card>

              {/* Radar Chart and Treemap in a grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Radar Chart */}
                {Object.keys(goalsByType).length > 0 && (
                  <Card data-testid="radar-chart">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        Subject Proficiency Balance
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compare your performance across different subjects
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ApexRadarChart goalsByType={goalsByType} />
                    </CardContent>
                  </Card>
                )}

                {/* Treemap */}
                {allCategories.length > 0 && (
                  <Card data-testid="treemap-chart">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-emerald-500" />
                        Topic Structure Overview
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hierarchical view of all topics and their completion status
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ApexTreemapChart allCategories={allCategories} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
