import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
import { useLocation } from "wouter";
import { navigate } from "wouter/use-browser-location";
import SidebarLayout from "@/components/sidebar-layout";

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
const fetchsubtopics = async (topicId: string) => {
  const response = await apiRequest(
    "GET",
    `api/goal-topics/${topicId}/subtopics`,
  );
  return response.json();
};

const updateSubtopicStatus = async (
  subtopicId: string,
  status: "pending" | "start" | "completed",
) => {
  const response = await apiRequest(
    "PATCH",
    `/api/goal-subtopics/${subtopicId}`,
    { status },
  );
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
    refetch,
  } = useQuery<TopicWithSubtopics>({
    queryKey: ["topic-subtopics", topicId],
    queryFn: () => fetchsubtopics(topicId),
    enabled: !!topicId && !!user,
  });

  // Update subtopic status mutation
  const updateSubtopicMutation = useMutation({
    mutationFn: ({
      subtopicId,
      status,
    }: {
      subtopicId: string;
      status: "pending" | "start" | "completed";
    }) => updateSubtopicStatus(subtopicId, status),
    onSuccess: () => {
      toast({ title: "Success", description: "Subtopic status updated" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["topic-subtopics", topicId] });
    },
    onError: (err: Error) => {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const goBackToTopics = () => {
    navigate(`/goal-tracker/${topicData?.category?.goalId}`, { replace: true });
  };

  const handleStatusChange = (
    subtopicId: string,
    status: "pending" | "start" | "completed",
  ) => {
    updateSubtopicMutation.mutate({ subtopicId, status });
  };

  if (!user) {
    return (
      <SidebarLayout
        title="Subtopics"
        description="Sign in to manage your learning tasks"
        contentClassName="max-w-6xl mx-auto"
      >
        <div className="text-center text-gray-600 dark:text-gray-300">
          Please log in to view this topic.
        </div>
      </SidebarLayout>
    );
  }

  if (isLoading) {
    return (
      <SidebarLayout
        title="Loading subtopics..."
        contentClassName="max-w-6xl mx-auto space-y-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !topicData) {
    return (
      <SidebarLayout title="Subtopics" contentClassName="max-w-6xl mx-auto">
        <div className="text-red-600 dark:text-red-400">
          Error loading subtopics:{" "}
          {error ? (error as Error).message : "Topic not found"}
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title={topicData.name}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToTopics}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Button>
      }
      contentClassName="max-w-6xl mx-auto space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Progress: {topicData.completedSubtopics} /{" "}
            {topicData.totalSubtopics} completed
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subtopic</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topicData.subtopics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No subtopics found for this topic.
                    </TableCell>
                  </TableRow>
                ) : (
                  topicData.subtopics.map((subtopic) => (
                    <TableRow key={subtopic.id}>
                      <TableCell className="font-medium">
                        {subtopic.name}
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={subtopic.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              subtopic.id,
                              value as Subtopic["status"],
                            )
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="start">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
