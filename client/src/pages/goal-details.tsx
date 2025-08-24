import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  BookOpen,
  Flag,
  Calendar,
  ArrowLeft,
  TrendingUp,
  FileText
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { Link, useLocation } from "wouter";

interface GoalSubtopic {
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

interface GoalTopic {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  totalSubtopics: number;
  completedSubtopics: number;
  createdAt: string;
  updatedAt: string;
  subtopics: GoalSubtopic[];
}

interface GoalCategory {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
  topics: GoalTopic[];
}

interface Goal {
  id: string;
  userId: number;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
  updatedAt: string;
  categories: GoalCategory[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'start':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'start':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
};

export default function GoalDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/goal-tracker/:id");
  const [, setLocation] = useLocation();
  const goalId = params?.id;
  const [newSubtopicData, setNewSubtopicData] = useState({
    name: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: ""
  });

  // Fetch goal with categories, topics, and subtopics
  const { data: goal, isLoading } = useQuery<Goal>({
    queryKey: [`/api/goals/${goalId}`],
    enabled: !!user && !!goalId
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete goal");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goal deleted",
        description: "Goal has been successfully deleted."
      });
      setLocation("/goal-tracker");
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update subtopic status mutation
  const updateSubtopicStatusMutation = useMutation({
    mutationFn: async ({ subtopicId, status, notes }: { 
      subtopicId: string; 
      status: "pending" | "start" | "completed"; 
      notes?: string;
    }) => {
      const response = await fetch(`/api/subtopics/${subtopicId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update subtopic status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Subtopic status updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goalId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update subtopic status",
        variant: "destructive"
      });
    }
  });

  // Create subtopic mutation
  const createSubtopicMutation = useMutation({
    mutationFn: async ({ topicId, subtopicData }: { 
      topicId: string; 
      subtopicData: typeof newSubtopicData;
    }) => {
      const response = await fetch(`/api/topics/${topicId}/subtopics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(subtopicData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create subtopic");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Subtopic created successfully"
      });
      setNewSubtopicData({ name: "", description: "", priority: "medium", dueDate: "" });
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goalId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create subtopic",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = useCallback((subtopicId: string, currentStatus: "pending" | "start" | "completed") => {
    // Cycle through the 3 states: pending -> start -> completed -> pending
    let nextStatus: "pending" | "start" | "completed";
    switch (currentStatus) {
      case 'pending':
        nextStatus = 'start';
        break;
      case 'start':
        nextStatus = 'completed';
        break;
      case 'completed':
        nextStatus = 'pending';
        break;
      default:
        nextStatus = 'pending';
    }
    updateSubtopicStatusMutation.mutate({ subtopicId, status: nextStatus });
  }, [updateSubtopicStatusMutation]);

  const handleCreateSubtopic = useCallback((topicId: string) => {
    if (!newSubtopicData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Subtopic name is required",
        variant: "destructive"
      });
      return;
    }
    
    createSubtopicMutation.mutate({ topicId, subtopicData: newSubtopicData });
  }, [newSubtopicData, createSubtopicMutation, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading goal details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Goal not found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The goal you're looking for doesn't exist or you don't have access to it.
                </p>
                <Link href="/goal-tracker">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Goals
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const overallProgress = goal.totalTopics > 0 ? (goal.completedTopics / goal.totalTopics) * 100 : 0;

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6" data-testid="goal-details-page">
          {/* Goal Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link href="/goal-tracker">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Goals
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="goal-title">
                    {goal.name}
                  </h1>
                  {goal.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Delete Goal Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    data-testid="button-delete-goal"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Goal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-testid="delete-goal-dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{goal.name}"? This action cannot be undone. 
                      All categories, topics, and subtopics will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      disabled={deleteGoalMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-confirm-delete"
                    >
                      {deleteGoalMutation.isPending ? "Deleting..." : "Delete Goal"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Progress Section */}
          <div className="flex justify-end">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Overall Progress
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(overallProgress)}%
                </div>
                <div className="w-32">
                  <Progress value={overallProgress} className="h-3" data-testid="overall-progress" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {goal.completedTopics} of {goal.totalTopics} completed
              </div>
            </div>
          </div>

          <Separator />

          {/* Goal Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="goal-progress-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Progress Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {Math.round(overallProgress)}%
                    </span>
                    <span className="text-sm text-gray-600">
                      {goal.completedTopics} / {goal.totalTopics}
                    </span>
                  </div>
                  <Progress 
                    value={overallProgress} 
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    {goal.completedTopics} topics completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="goal-categories-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {goal.categories.length}
                    </span>
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Organized into {goal.categories.length} categories
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="goal-dates-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(goal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(goal.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories with Topics and Subtopics */}
          <div className="space-y-4">
            {goal.categories.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No categories yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This goal doesn't have any categories or topics yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4" data-testid="categories-accordion">
                {goal.categories.map((category) => {
                  const categoryProgress = category.totalTopics > 0 
                    ? (category.completedTopics / category.totalTopics) * 100 
                    : 0;

                  return (
                    <AccordionItem key={category.id} value={category.id} className="border-0">
                      <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {category.name}
                                </h3>
                                {category.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {Math.round(categoryProgress)}% Complete
                                </div>
                                <div className="text-xs text-gray-500">
                                  {category.completedTopics} of {category.totalTopics} topics
                                </div>
                              </div>
                              <div className="w-24">
                                <Progress value={categoryProgress} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-4">
                            {category.topics.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                No topics in this category yet
                              </div>
                            ) : (
                              <Accordion type="single" collapsible className="space-y-2">
                                {category.topics.map((topic) => {
                                  const topicProgress = topic.totalSubtopics > 0 
                                    ? (topic.completedSubtopics / topic.totalSubtopics) * 100 
                                    : 0;

                                  return (
                                    <AccordionItem key={topic.id} value={topic.id} className="border-0">
                                      <Card className="border border-gray-200 dark:border-gray-700">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                          <div className="flex items-center justify-between w-full mr-4">
                                            <div className="flex items-center gap-3">
                                              <div>
                                                <div className="text-base font-semibold text-gray-900 dark:text-gray-100 text-left">
                                                  {topic.name}
                                                </div>
                                                {topic.description && (
                                                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                                    {topic.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                              <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                  {Math.round(topicProgress)}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {topic.completedSubtopics} / {topic.totalSubtopics}
                                                </div>
                                              </div>
                                              <div className="w-20">
                                                <Progress value={topicProgress} className="h-2" />
                                              </div>
                                              
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    data-testid={`button-add-subtopic-${topic.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Subtopic
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                  <DialogHeader>
                                                    <DialogTitle>Add New Subtopic</DialogTitle>
                                                  </DialogHeader>
                                                  <div className="space-y-4">
                                                    <div>
                                                      <label className="text-sm font-medium">Name</label>
                                                      <Input
                                                        value={newSubtopicData.name}
                                                        onChange={(e) => setNewSubtopicData(prev => ({
                                                          ...prev,
                                                          name: e.target.value
                                                        }))}
                                                        placeholder="Enter subtopic name"
                                                        data-testid="input-subtopic-name"
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="text-sm font-medium">Description</label>
                                                      <Textarea
                                                        value={newSubtopicData.description}
                                                        onChange={(e) => setNewSubtopicData(prev => ({
                                                          ...prev,
                                                          description: e.target.value
                                                        }))}
                                                        placeholder="Optional description"
                                                        data-testid="input-subtopic-description"
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="text-sm font-medium">Priority</label>
                                                      <select
                                                        value={newSubtopicData.priority}
                                                        onChange={(e) => setNewSubtopicData(prev => ({
                                                          ...prev,
                                                          priority: e.target.value as "low" | "medium" | "high"
                                                        }))}
                                                        className="w-full p-2 border rounded-md"
                                                        data-testid="select-subtopic-priority"
                                                      >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                      </select>
                                                    </div>
                                                    <div>
                                                      <label className="text-sm font-medium">Due Date</label>
                                                      <Input
                                                        type="date"
                                                        value={newSubtopicData.dueDate}
                                                        onChange={(e) => setNewSubtopicData(prev => ({
                                                          ...prev,
                                                          dueDate: e.target.value
                                                        }))}
                                                        data-testid="input-subtopic-due-date"
                                                      />
                                                    </div>
                                                    <Button
                                                      onClick={() => handleCreateSubtopic(topic.id)}
                                                      disabled={createSubtopicMutation.isPending}
                                                      className="w-full"
                                                      data-testid="button-create-subtopic"
                                                    >
                                                      {createSubtopicMutation.isPending ? "Creating..." : "Create Subtopic"}
                                                    </Button>
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            </div>
                                          </div>
                                        </AccordionTrigger>
                                        
                                        <AccordionContent className="px-4 pb-4">
                                          {topic.subtopics.length === 0 ? (
                                            <div className="text-center py-6 text-gray-500">
                                              No subtopics yet. Click "Add Subtopic" to get started.
                                            </div>
                                          ) : (
                                            <div className="space-y-3">
                                              {topic.subtopics
                                                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                .map((subtopic) => (
                                                <div
                                                  key={subtopic.id}
                                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                  data-testid={`subtopic-${subtopic.id}`}
                                                >
                                                  <div className="flex items-center gap-3">
                                                    {getStatusIcon(subtopic.status)}
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                                          {subtopic.name}
                                                        </span>
                                                        <Badge className={getPriorityColor(subtopic.priority)}>
                                                          <Flag className="h-3 w-3 mr-1" />
                                                          {subtopic.priority}
                                                        </Badge>
                                                      </div>
                                                      {subtopic.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                          {subtopic.description}
                                                        </p>
                                                      )}
                                                      {subtopic.dueDate && (
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                          <Calendar className="h-3 w-3" />
                                                          Due: {new Date(subtopic.dueDate).toLocaleDateString()}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(subtopic.status)}>
                                                      {subtopic.status.replace('_', ' ')}
                                                    </Badge>
                                                    
                                                    <Button
                                                      size="sm"
                                                      variant={subtopic.status === 'completed' ? 'default' : 'outline'}
                                                      onClick={() => handleStatusChange(subtopic.id, subtopic.status)}
                                                      disabled={updateSubtopicStatusMutation.isPending}
                                                      data-testid={`button-toggle-status-${subtopic.id}`}
                                                      className={subtopic.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 
                                                               subtopic.status === 'start' ? 'border-yellow-500 text-yellow-700 hover:bg-yellow-50' : ''}
                                                    >
                                                      {subtopic.status === 'pending' ? 'Start' : 
                                                       subtopic.status === 'start' ? 'Complete' : 
                                                       'Pending'}
                                                    </Button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </AccordionContent>
                                      </Card>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>
                            )}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}