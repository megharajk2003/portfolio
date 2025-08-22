import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as TimelineIcon, 
  Target, 
  Clock, 
  CheckCircle, 
  Trash2,
  Sparkles,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function CareerTimeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetRole, setTargetRole] = useState("");

  // Fetch existing timelines
  const { data: timelines = [], isLoading: isLoadingTimelines } = useQuery({
    queryKey: ["/api/career-timeline", user?.id],
    enabled: !!user,
  });

  // Generate new timeline mutation
  const generateTimeline = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/career-timeline`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career-timeline", user?.id] });
      toast({
        title: "Career Timeline Generated!",
        description: "Your personalized career roadmap is ready.",
      });
      setTargetRole("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate career timeline. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete timeline mutation
  const deleteTimeline = useMutation({
    mutationFn: async (timelineId: string) => {
      return apiRequest(`/api/career-timeline/${timelineId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career-timeline", user?.id] });
      toast({
        title: "Timeline Deleted",
        description: "Career timeline has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete timeline. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your target role.",
        variant: "destructive",
      });
      return;
    }

    generateTimeline.mutate({
      userId: user?.id,
      targetRole: targetRole.trim(),
    });
  };

  const handleDelete = (timelineId: string) => {
    if (confirm("Are you sure you want to delete this timeline?")) {
      deleteTimeline.mutate(timelineId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <TimelineIcon className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">AI Career Timeline</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate detailed career progression roadmaps with AI. Get phase-by-phase plans 
          with milestones and skills to develop for your target role.
        </p>
      </div>

      {/* Generate Timeline Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Generate New Timeline
          </CardTitle>
          <CardDescription>
            Enter your target role to generate a personalized career roadmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="targetRole">Target Role</Label>
              <Input
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Product Manager, Tech Lead, Director of Engineering"
                data-testid="input-target-role"
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={generateTimeline.isPending}
                data-testid="button-generate-timeline"
              >
                {generateTimeline.isPending ? (
                  "Generating..."
                ) : (
                  <>
                    <TimelineIcon className="h-4 w-4 mr-2" />
                    Generate Timeline
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Timelines */}
      {isLoadingTimelines ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading timelines...</p>
        </div>
      ) : timelines.length > 0 ? (
        <div className="space-y-6">
          {timelines.map((timeline: any) => (
            <Card key={timeline.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      {timeline.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {timeline.targetRole}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeline.estimatedDuration}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(timeline.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(timeline.id)}
                    disabled={deleteTimeline.isPending}
                    data-testid={`button-delete-timeline-${timeline.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {timeline.timeline && timeline.timeline.length > 0 ? (
                  <div className="space-y-6">
                    {timeline.timeline.map((phase: any, index: number) => (
                      <div key={index} className="relative">
                        {/* Timeline connector */}
                        {index < timeline.timeline.length - 1 && (
                          <div className="absolute left-4 top-12 w-0.5 h-16 bg-green-200"></div>
                        )}
                        
                        <div className="flex gap-4">
                          {/* Phase number */}
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          
                          {/* Phase content */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="font-semibold text-lg">{phase.phase}</h4>
                              <Badge variant="secondary" className="mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {phase.duration}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground">{phase.description}</p>
                            
                            {/* Milestones */}
                            {phase.milestones && phase.milestones.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-muted-foreground mb-2">Key Milestones</h5>
                                <ul className="space-y-1">
                                  {phase.milestones.map((milestone: string, mIndex: number) => (
                                    <li key={mIndex} className="flex items-start gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                      {milestone}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Skills */}
                            {phase.skills && phase.skills.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-muted-foreground mb-2">Skills to Develop</h5>
                                <div className="flex flex-wrap gap-1">
                                  {phase.skills.map((skill: string, sIndex: number) => (
                                    <Badge key={sIndex} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No timeline phases available.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <TimelineIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No career timelines yet. Generate your first timeline to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}