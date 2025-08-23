import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft,
  Target,
  TrendingUp,
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText
} from "lucide-react";
import { Link } from "wouter";

interface GoalTopic {
  id: string;
  categoryId: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  notes?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalCategory {
  id: string;
  goalId: string;
  name: string;
  totalTopics: number;
  completedTopics: number;
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

export default function GoalDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/goal-tracker/:id");
  const goalId = params?.id;
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch specific goal with categories and topics
  const { data: goal, isLoading } = useQuery<Goal>({
    queryKey: ["/api/goals", goalId],
    enabled: !!goalId && !!user
  });

  // Topic status update mutation
  const updateTopicStatusMutation = useMutation({
    mutationFn: async (data: { topicId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/topics/${data.topicId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: data.status, notes: data.notes })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update topic");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals", goalId] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Status updated",
        description: "Topic status has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update topic status",
        variant: "destructive"
      });
    }
  });

  const handleTopicStatusChange = (topicId: string, newStatus: string, notes?: string) => {
    updateTopicStatusMutation.mutate({
      topicId,
      status: newStatus,
      notes
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6" data-testid="loading-goal-details">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto p-6" data-testid="goal-not-found">
        <div className="text-center py-8">
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
              Back to Goal Tracker
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="goal-details-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/goal-tracker">
          <Button variant="outline" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="goal-title">
              {goal.name}
            </h1>
          </div>
          {goal.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {/* Goal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="goal-progress-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {Math.round((goal.completedTopics / goal.totalTopics) * 100)}%
                </span>
                <span className="text-sm text-gray-600">
                  {goal.completedTopics} / {goal.totalTopics}
                </span>
              </div>
              <Progress 
                value={(goal.completedTopics / goal.totalTopics) * 100} 
                className="h-3"
                data-testid="overall-progress"
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

      {/* Categories and Topics */}
      <Card data-testid="categories-topics-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Categories & Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goal.categories.map((category) => (
              <div key={category.id} className="border rounded-lg">
                <Collapsible
                  open={expandedCategories.has(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        {expandedCategories.has(category.id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <h5 className="font-medium text-lg">{category.name}</h5>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {category.completedTopics} / {category.totalTopics}
                        </span>
                        <div className="w-24">
                          <Progress 
                            value={(category.completedTopics / category.totalTopics) * 100} 
                            className="h-2"
                          />
                        </div>
                        <Badge className={getStatusColor(
                          category.completedTopics === category.totalTopics ? 'completed' : 
                          category.completedTopics > 0 ? 'in_progress' : 'pending'
                        )}>
                          {Math.round((category.completedTopics / category.totalTopics) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="space-y-3 pt-4">
                        {category.topics.map((topic) => (
                          <div key={topic.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Checkbox
                              checked={topic.status === 'completed'}
                              onCheckedChange={(checked) => {
                                handleTopicStatusChange(
                                  topic.id,
                                  checked ? 'completed' : 'pending'
                                );
                              }}
                              data-testid={`checkbox-topic-${topic.id}`}
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(topic.status)}
                                <span className={`font-medium ${
                                  topic.status === 'completed' ? 'line-through text-gray-500' : ''
                                }`}>
                                  {topic.name}
                                </span>
                              </div>
                              
                              {topic.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {topic.notes}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>Created: {new Date(topic.createdAt).toLocaleDateString()}</span>
                                {topic.completedAt && (
                                  <span>Completed: {new Date(topic.completedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            
                            <Badge className={getStatusColor(topic.status)}>
                              {topic.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}