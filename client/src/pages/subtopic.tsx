import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ListChecks } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useLocation } from "wouter";
import { navigate } from "wouter/use-browser-location";

// Interfaces
interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  description?: string;
  status: "pending" | "start" | "completed";
  priority: "low" | "medium" | "high";
  notes?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TopicWithSubtopics {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  totalSubtopics: number;
  completedSubtopics: number;
  subtopics: Subtopic[];
  category: {
    id: string;
    goalId: string;
    name: string;
    description?: string;
  };
}

// API functions
const fetchTopicSubtopics = async (topicId: string): Promise<TopicWithSubtopics> => {
  const response = await fetch(`/api/goal-topics/${topicId}/subtopics`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch subtopics");
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

export default function SubtopicStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Extract topic ID from URL: /subtopic/{topicId}
  const topicId = location.split("/")[2];

  // Fetch topic and its subtopics
  const { 
    data: topicData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["topic-subtopics", topicId],
    queryFn: () => fetchTopicSubtopics(topicId),
    enabled: !!topicId && !!user,
  });

  // Update subtopic status mutation
  const updateSubtopicMutation = useMutation({
    mutationFn: ({ subtopicId, status }: { subtopicId: string; status: "pending" | "start" | "completed" }) =>
      updateSubtopicStatus(subtopicId, status),
    onSuccess: () => {
      toast({ title: "Success", description: "Subtopic status updated" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["category-topics"] });
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
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

  const handleStatusChange = (subtopicId: string, newStatus: "pending" | "start" | "completed") => {
    updateSubtopicMutation.mutate({ subtopicId, status: newStatus });
  };

  const goBackToTopics = () => {
    if (topicData?.category) {
      navigate(`/goal-tracker/${topicData.category.goalId}/category/${topicData.category.id}`);
    } else {
      navigate("/goal-tracker");
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-center">Please log in to view subtopics.</div>
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

  if (error || !topicData) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-red-600 dark:text-red-400">
              Error loading subtopics: {error ? (error as Error).message : "Topic not found"}
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
                onClick={goBackToTopics}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Topics
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Subtopic Status
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <ListChecks className="h-4 w-4 inline mr-1" />
                  {topicData.name}
                </p>
              </div>
            </div>
          </div>

          {/* Subtopics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-blue-500" />
                {topicData.name}
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: {topicData.completedSubtopics} / {topicData.totalSubtopics} subtopics completed
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Subtopic</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topicData.subtopics.map((subtopic) => (
                      <TableRow key={subtopic.id}>
                        <TableCell className="font-medium">
                          {topicData.category.name}
                        </TableCell>
                        <TableCell>{topicData.name}</TableCell>
                        <TableCell>{subtopic.name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(subtopic.status)}>
                            {subtopic.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={subtopic.status}
                            onValueChange={(value: "pending" | "start" | "completed") =>
                              handleStatusChange(subtopic.id, value)
                            }
                            disabled={updateSubtopicMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="start">Start</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {topicData.subtopics.length === 0 && (
                <div className="text-center py-8">
                  <ListChecks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Subtopics Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This topic doesn't have any subtopics yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}