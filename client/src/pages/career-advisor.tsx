import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Lightbulb,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function CareerAdvisor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetRole, setTargetRole] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");

  // Fetch existing career advice
  const { data: advisories = [], isLoading: isLoadingAdvisories } = useQuery({
    queryKey: ["/api/career-advice", user?.id],
    enabled: !!user,
  });

  // Generate new advice mutation
  const generateAdvice = useMutation({
    mutationFn: async (data: any) => {
      console.log('🎯 [FRONTEND] Generating career advice with data:', data);
      return apiRequest("POST", `/api/career-advice`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career-advice", user?.id] });
      toast({
        title: "Career Advice Generated!",
        description: "Your personalized career guidance is ready.",
      });
      // Reset form
      setTargetRole("");
      setCareerGoals("");
      setCurrentLevel("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate career advice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !currentLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in your target role and current level.",
        variant: "destructive",
      });
      return;
    }

    generateAdvice.mutate({
      userId: user?.id,
      targetRole: targetRole.trim(),
      careerGoals: careerGoals.trim(),
      currentLevel,
    });
  };

  const advisoriesArray = Array.isArray(advisories) ? advisories : [];
  const latestAdvice = advisoriesArray[0]; // Most recent advice

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <BrainCircuit className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Personal Career Advisor</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Get AI-powered career guidance tailored to your profile, skills, and goals. 
          Receive personalized recommendations for your professional growth.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Generate New Advice */}
        <div className="lg:col-span-2">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Generate Career Advice
            </CardTitle>
            <CardDescription>
              Tell us about your career aspirations and current situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role *</Label>
                <Input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                  data-testid="input-target-role"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLevel">Current Level *</Label>
                <Select value={currentLevel} onValueChange={setCurrentLevel}>
                  <SelectTrigger data-testid="select-current-level">
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="careerGoals">Career Goals (Optional)</Label>
                <Textarea
                  id="careerGoals"
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="Describe your long-term career aspirations..."
                  rows={3}
                  data-testid="textarea-career-goals"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={generateAdvice.isPending}
                data-testid="button-generate-advice"
              >
                {generateAdvice.isPending ? (
                  "Generating Advice..."
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Generate AI Advice
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>

        {/* Latest Advice Display */}
        <div className="lg:col-span-3">
        <Card className={`shadow-lg border-0 ${latestAdvice ? "bg-gradient-to-br from-green-50 to-emerald-100" : "bg-gradient-to-br from-gray-50 to-slate-100"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Latest Career Guidance
            </CardTitle>
            <CardDescription>
              {latestAdvice ? "Your most recent AI-generated career advice" : "Generate your first career advice to see personalized guidance"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAdvisories ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading advice...</p>
              </div>
            ) : latestAdvice ? (
              <div className="space-y-6 max-w-none">
                {/* Target Role & Level */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Target className="h-3 w-3 mr-1" />
                    {latestAdvice.targetRole}
                  </Badge>
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {latestAdvice.currentLevel} Level
                  </Badge>
                </div>

                {/* Main Advice */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                  <h4 className="font-semibold text-lg text-green-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Career Guidance
                  </h4>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    <p className="whitespace-pre-wrap text-base">{latestAdvice.advice}</p>
                  </div>
                </div>

                {/* Recommendations */}
                {latestAdvice.recommendations && latestAdvice.recommendations.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                    <h4 className="font-semibold text-lg text-blue-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Key Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {latestAdvice.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-base leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Gaps */}
                {latestAdvice.skillGaps && latestAdvice.skillGaps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-1">
                      {latestAdvice.skillGaps.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {latestAdvice.nextSteps && latestAdvice.nextSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Next Steps</h4>
                    <ul className="space-y-1">
                      {latestAdvice.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Generated on {new Date(latestAdvice.createdAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Generate your first career advice to get started!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Previous Advice History */}
      {advisoriesArray.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Advice</CardTitle>
            <CardDescription>
              Your career advice history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advisoriesArray.slice(1).map((advice: any) => (
                <div key={advice.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline">{advice.targetRole}</Badge>
                      <Badge variant="outline">{advice.currentLevel}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(advice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {advice.advice}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}