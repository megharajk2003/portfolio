import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/sidebar";
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
  TrendingUp,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

export default function CareerTimeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetRole, setTargetRole] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch existing timelines
  const { data: timelines = [], isLoading: isLoadingTimelines } = useQuery({
    queryKey: ["/api/career-timeline", user?.id],
    enabled: !!user,
  });

  // Generate new timeline mutation
  const generateTimeline = useMutation({
    mutationFn: async (data: any) => {
      console.log("🚀 [CLIENT] Generating timeline with data:", data);
      console.log("🚀 [CLIENT] User ID:", user?.id);
      const response = await apiRequest("POST", "/api/career-timeline", data);
      const result = await response.json();
      console.log("✅ [CLIENT] Timeline generation response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/career-timeline", user?.id],
      });
      toast({
        title: "Career Timeline Generated!",
        description: "Your personalized career roadmap is ready.",
      });
      setTargetRole("");
    },
    onError: (error: any) => {
      console.error("❌ [CLIENT] Error generating timeline:", error);
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
      console.log("🗑️ [CLIENT] Deleting timeline:", timelineId);
      const response = await apiRequest(
        "DELETE",
        `/api/career-timeline/${timelineId}`
      );
      const result = await response.json();
      console.log("✅ [CLIENT] Timeline deletion response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/career-timeline", user?.id],
      });
      toast({
        title: "Timeline Deleted",
        description: "Career timeline has been removed.",
      });
    },
    onError: (error: any) => {
      console.error("❌ [CLIENT] Error deleting timeline:", error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Unified Sidebar (Fixed) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          bg-white dark:bg-gray-800 border-r dark:border-gray-700
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 px-10 pt-2 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <Card className="mb-2 bg-gradient-to-r from-green-600 via-white-600 to-purple-400 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <TimelineIcon className="h-8 w-8 text-white" />
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    AI Career Timeline
                  </h1>
                </div>

                <p className="text-blue-100 text-lg">
                  Generate detailed career progression roadmaps with AI. Get
                  phase-by-phase plans with milestones and skills to develop for
                  your target role.
                </p>
              </div>
              <Link href="/career-tools">
                <Button
                  variant="outline"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 shadow-lg"
                >
                  ← Back to Career Tools
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h2 className="text-lg font-semibold">AI Career Timeline</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="max-w-7xl mx-auto p-4 space-y-8">
          {/* Header */}

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
          ) : Array.isArray(timelines) && timelines.length > 0 ? (
            <div className="space-y-8">
              {timelines.map((timeline: any) => (
                <Card
                  key={timeline.id}
                  className="relative shadow-lg border-0 bg-gradient-to-br from-white to-green-50"
                >
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
                              <div className="flex-1 space-y-4 bg-white rounded-xl p-6 shadow-sm border border-green-200 ml-4">
                                <div>
                                  <h4 className="font-semibold text-lg">
                                    {phase.phase}
                                  </h4>
                                  <Badge variant="secondary" className="mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {phase.duration}
                                  </Badge>
                                </div>

                                <p className="text-gray-700 leading-relaxed text-base">
                                  {phase.description}
                                </p>

                                {/* Milestones */}
                                {phase.milestones &&
                                  phase.milestones.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                        Key Milestones
                                      </h5>
                                      <ul className="space-y-2">
                                        {phase.milestones.map(
                                          (
                                            milestone: string,
                                            mIndex: number
                                          ) => (
                                            <li
                                              key={mIndex}
                                              className="flex items-start gap-3 text-base"
                                            >
                                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                              </div>
                                              <span className="text-gray-700">
                                                {milestone}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                {/* Skills */}
                                {phase.skills && phase.skills.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                      Skills to Develop
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {phase.skills.map(
                                        (skill: string, sIndex: number) => (
                                          <Badge
                                            key={sIndex}
                                            className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1.5 text-sm font-medium border border-green-300"
                                          >
                                            {skill}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No timeline phases available.
                      </p>
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
                  No career timelines yet. Generate your first timeline to get
                  started!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
