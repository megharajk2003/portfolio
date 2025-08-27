import { useState, useMemo } from "react";
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
import { ArrowLeft, Target, Edit2, Trash2, Plus, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import Sidebar from "@/components/sidebar";

// Interfaces
interface GoalCategory {
  id: string;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
}

interface GoalTopic {
  id: string;
  name: string;
  description?: string;
  totalSubtopics: number;
  completedSubtopics: number;
}

interface GoalSubtopic {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "start" | "completed";
  priority: "low" | "medium" | "high";
  notes?: string;
  dueDate?: string;
  completedAt?: string;
}

interface GoalWithDetails {
  id: string;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
  categories: (GoalCategory & {
    topics: (GoalTopic & { subtopics: GoalSubtopic[] })[];
  })[];
}

// API functions
const fetchGoalWithCategories = async (goalId: string): Promise<GoalWithDetails> => {
  const response = await fetch(`/api/goals/${goalId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch goal details");
  }
  return response.json();
};

const updateSubtopicStatus = async (subtopicId: string, status: "pending" | "start" | "completed") => {
  const response = await fetch(`/api/goal-subtopics/${subtopicId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update subtopic status");
  }
  return response.json();
};

const deleteGoal = async (goalId: string) => {
  const response = await fetch(`/api/goals/${goalId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete goal");
  }
  return response.json();
};

export default function GoalDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoalName, setEditedGoalName] = useState("");
  const [editedGoalDescription, setEditedGoalDescription] = useState("");

  // Extract goal ID from URL
  const goalId = location.split("/")[2]; // /goal-details/{goalId}

  // Fetch goal details
  const { 
    data: goal, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => fetchGoalWithCategories(goalId),
    enabled: !!goalId && !!user,
  });

  // Update subtopic status mutation
  const updateSubtopicMutation = useMutation({
    mutationFn: ({ subtopicId, status }: { subtopicId: string; status: "pending" | "start" | "completed" }) =>
      updateSubtopicStatus(subtopicId, status),
    onSuccess: () => {
      toast({ title: "Success", description: "Subtopic status updated" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      toast({ title: "Success", description: "Goal deleted successfully" });
      navigate("/goal-tracker");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
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
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleSubtopicStatusToggle = (subtopicId: string, currentStatus: string) => {
    let newStatus: "pending" | "start" | "completed";
    switch (currentStatus) {
      case "pending":
        newStatus = "start";
        break;
      case "start":
        newStatus = "completed";
        break;
      case "completed":
        newStatus = "pending";
        break;
      default:
        newStatus = "start";
    }
    
    updateSubtopicMutation.mutate({ subtopicId, status: newStatus });
  };

  const handleDeleteGoal = () => {
    if (window.confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-center">Please log in to view goal details.</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
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

  if (error || !goal) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-red-600 dark:text-red-400">
              Error loading goal: {error ? (error as Error).message : "Goal not found"}
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/goal-tracker")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Goals
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {goal.name}
                </h1>
                {goal.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Goal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteGoal}
                className="text-red-600 hover:text-red-700"
                disabled={deleteGoalMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteGoalMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>

          {/* Goal Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Goal Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {goal.categories.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Categories
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {goal.totalTopics}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Topics
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {goal.totalSubtopics}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Subtopics
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {goal.completedSubtopics}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completed
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((goal.completedSubtopics / goal.totalSubtopics) * 100)}%
                  </span>
                </div>
                <Progress
                  value={goal.totalSubtopics > 0 ? (goal.completedSubtopics / goal.totalSubtopics) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories and Topics */}
          <div className="space-y-6">
            {goal.categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <Badge variant="outline">
                      {category.topics.length} topics
                    </Badge>
                  </CardTitle>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.topics.map((topic) => (
                    <div key={topic.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{topic.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {topic.completedSubtopics} / {topic.totalSubtopics}
                          </span>
                          <Progress
                            value={
                              topic.totalSubtopics > 0
                                ? (topic.completedSubtopics / topic.totalSubtopics) * 100
                                : 0
                            }
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                      
                      {topic.subtopics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {topic.subtopics.map((subtopic) => (
                            <div
                              key={subtopic.id}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {subtopic.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={getStatusColor(subtopic.status)}
                                  >
                                    {subtopic.status}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={getPriorityColor(subtopic.priority)}
                                  >
                                    {subtopic.priority}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSubtopicStatusToggle(subtopic.id, subtopic.status)
                                }
                                disabled={updateSubtopicMutation.isPending}
                                className="ml-2"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {goal.categories.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Categories Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This goal doesn't have any categories or topics yet. Try uploading a CSV file to populate it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}