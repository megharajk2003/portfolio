import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import Sidebar from "@/components/sidebar";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useLocation } from "wouter";
import { navigate } from "wouter/use-browser-location";
// --- INTERFACES ---
interface GoalCategory {
  id: string;
  goalId: string;
  name: string;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  completedSubtopicTimestamps?: string[];
}

interface Goal {
  id: string;
  name: string;
  description?: string;
  categories?: GoalCategory[];
}

// --- API FUNCTION ---
const fetchGoalWithCategories = async (goalId: string): Promise<Goal> => {
  const response = await fetch(`/api/goals/${goalId}`);
  if (!response.ok) throw new Error("Failed to fetch goal details");
  return response.json();
};

// --- CHART COMPONENT ---
const ApexCategoryProgressChart: React.FC<{ categories: GoalCategory[] }> = ({
  categories,
}) => {
  const chartState = useMemo(() => {
    const series = categories.map((category) => ({
      name: category.name,
      data: [] as [number, number][],
    }));

    const allTimestamps = categories
      .flatMap((cat) =>
        (cat.completedSubtopicTimestamps || []).map((ts) => ({
          catName: cat.name,
          timestamp: new Date(ts),
        }))
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const cumulativeCounts: { [key: string]: number } = {};
    categories.forEach((cat) => (cumulativeCounts[cat.name] = 0));

    categories.forEach((cat) => {
      const seriesIndex = series.findIndex((s) => s.name === cat.name);
      if (seriesIndex > -1) {
        series[seriesIndex].data.push([new Date(cat.createdAt).getTime(), 0]);
      }
    });

    allTimestamps.forEach(({ catName, timestamp }) => {
      cumulativeCounts[catName]++;
      const seriesIndex = series.findIndex((s) => s.name === catName);
      if (seriesIndex > -1) {
        series[seriesIndex].data.push([
          timestamp.getTime(),
          cumulativeCounts[catName],
        ]);
      }
    });

    return { series };
  }, [categories]);

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: true },
      toolbar: { autoSelected: "zoom" },
    },
    title: { text: "Category Progress Over Time" },
    stroke: { curve: "stepline" },
    yaxis: {
      title: { text: "Subtopics Completed" },
      labels: { formatter: (val) => val.toFixed(0) },
    },
    xaxis: { type: "datetime" },
    tooltip: { y: { formatter: (val) => val.toFixed(0) } },
  };

  if (chartState.series.every((s) => s.data.length <= 1)) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No completion data to display for this period.
      </div>
    );
  }

  return (
    <ReactApexChart
      options={options}
      series={chartState.series}
      type="area"
      height={350}
    />
  );
};

export default function GoalTracker() {
  const { user } = useAuth();
  const [location] = useLocation();
  const goalId = location.split("/")[2];

  const {
    data: goal,
    isLoading: goalLoading,
    error: goalError,
  } = useQuery<Goal>({
    queryKey: ["goal", goalId],
    queryFn: () => fetchGoalWithCategories(goalId),
    enabled: !!goalId && !!user,
  });

  const categories = goal?.categories || [];

  const getStatusColor = (completed: number, total: number) => {
    if (total > 0 && completed === total) return "bg-green-100 text-green-800";
    if (completed > 0) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (completed: number, total: number) => {
    if (total > 0 && completed === total) return "Completed";
    if (completed > 0) return "In Progress";
    return "Not Started";
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {goal ? `${goal.name.toUpperCase()} Categories` : "Categories"}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/goals")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Goals
            </Button>
          </div>
        </header>
        <div className="container mx-auto p-6 space-y-6">
          {goalLoading && <div>Loading...</div>}
          {goalError && (
            <div className="text-red-500">
              Error: {(goalError as Error).message}
            </div>
          )}

          {!goalLoading && !goalError && (
            <>
              <div className="space-y-4">
                {categories.map((category: GoalCategory) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() =>
                      navigate(
                        `/goal-tracker/${goalId}/category/${category.id}`
                      )
                    }
                  >
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          {/* This is the part that was missing */}
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
                              (category.completedSubtopics /
                                category.totalSubtopics) *
                                100 || 0
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {Math.round(
                              (category.completedSubtopics /
                                category.totalSubtopics) *
                                100
                            ) || 0}
                            % Complete
                          </span>
                          <Badge
                            className={getStatusColor(
                              category.completedSubtopics,
                              category.totalSubtopics
                            )}
                          >
                            {getStatusText(
                              category.completedSubtopics,
                              category.totalSubtopics
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Category Progress Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ApexCategoryProgressChart categories={categories} />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
