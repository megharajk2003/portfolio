import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Upload,
  Target,
  TrendingUp,
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  FileSpreadsheet
} from "lucide-react";

interface Goal {
  id: string;
  userId: number;
  name: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
  updatedAt: string;
}

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

interface GoalWithCategories extends Goal {
  categories: GoalCategory[];
}

export default function GoalTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [goalName, setGoalName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch user's goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!user
  });

  // Fetch specific goal with categories and topics
  const { data: goalDetails } = useQuery<GoalWithCategories>({
    queryKey: ["/api/goals", selectedGoal],
    enabled: !!selectedGoal
  });

  // CSV upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: async (data: { goalName: string; csvData: any[] }) => {
      const response = await fetch("/api/goals/from-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create goal");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Goal created successfully from CSV data"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setCsvFile(null);
      setGoalName("");
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to create goal from CSV",
        variant: "destructive"
      });
    }
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
      queryClient.invalidateQueries({ queryKey: ["/api/goals", selectedGoal] });
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

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error("CSV must have at least a header row and one data row"));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
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
        description: "Please select a CSV file and enter a goal name",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const csvData = await parseCSV(csvFile);
      await csvUploadMutation.mutateAsync({
        goalName: goalName.trim(),
        csvData
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="goal-tracker-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="page-title">
            Goal Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload CSV files and track your progress with interactive visualizations
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-csv">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-upload-csv">
            <DialogHeader>
              <DialogTitle>Upload Goal from CSV</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="Enter a name for your goal"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  data-testid="input-goal-name"
                />
              </div>
              
              <div>
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  data-testid="input-csv-file"
                />
                <p className="text-sm text-gray-600 mt-2">
                  CSV should contain columns: Category, Topic, Status
                </p>
              </div>
              
              <Button
                onClick={handleCSVUpload}
                disabled={isUploading || !csvFile || !goalName.trim()}
                className="w-full"
                data-testid="button-submit-csv"
              >
                {isUploading ? "Uploading..." : "Create Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      {goalsLoading ? (
        <div className="text-center py-8" data-testid="loading-goals">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading your goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a CSV file to create your first goal and start tracking your progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedGoal === goal.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedGoal(goal.id)}
              data-testid={`card-goal-${goal.id}`}
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
                        {goal.completedTopics} / {goal.totalTopics}
                      </span>
                    </div>
                    <Progress 
                      value={(goal.completedTopics / goal.totalTopics) * 100} 
                      className="h-2"
                      data-testid={`progress-goal-${goal.id}`}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {Math.round((goal.completedTopics / goal.totalTopics) * 100)}% Complete
                    </span>
                    <Badge className={getStatusColor(
                      goal.completedTopics === goal.totalTopics ? 'completed' : 
                      goal.completedTopics > 0 ? 'in_progress' : 'pending'
                    )}>
                      {goal.completedTopics === goal.totalTopics ? 'Completed' : 
                       goal.completedTopics > 0 ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Details */}
      {selectedGoal && goalDetails && (
        <Card data-testid="goal-details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {goalDetails.name} - Detailed Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Overall Progress</h4>
                  <span className="text-lg font-bold">
                    {Math.round((goalDetails.completedTopics / goalDetails.totalTopics) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(goalDetails.completedTopics / goalDetails.totalTopics) * 100} 
                  className="h-3"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {goalDetails.completedTopics} of {goalDetails.totalTopics} topics completed
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Categories</h4>
                {goalDetails.categories.map((category) => (
                  <div key={category.id} className="border rounded-lg">
                    <Collapsible
                      open={expandedCategories.has(category.id)}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-3">
                            {expandedCategories.has(category.id) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            <h5 className="font-medium">{category.name}</h5>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              {category.completedTopics} / {category.totalTopics}
                            </span>
                            <div className="w-20">
                              <Progress 
                                value={(category.completedTopics / category.totalTopics) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4">
                          <div className="space-y-3">
                            {category.topics.map((topic) => (
                              <div key={topic.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}