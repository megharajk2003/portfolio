import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code
} from "lucide-react";

export default function ResumeGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [template, setTemplate] = useState("professional");
  const [selectedResume, setSelectedResume] = useState<any>(null);

  // Fetch existing resumes
  const { data: resumes = [], isLoading: isLoadingResumes } = useQuery({
    queryKey: ["/api/resumes", user?.id],
    enabled: !!user,
  });

  // Generate new resume mutation
  const generateResume = useMutation({
    mutationFn: async (data: any) => {
      console.log('🎯 [FRONTEND] Generating resume with data:', data);
      return apiRequest(`/api/resumes`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", user?.id] });
      toast({
        title: "Resume Generated!",
        description: "Your AI-powered resume is ready.",
      });
      setTitle("");
      setTargetRole("");
      setTemplate("professional");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete resume mutation
  const deleteResume = useMutation({
    mutationFn: async (resumeId: string) => {
      console.log('🎯 [FRONTEND] Deleting resume:', resumeId);
      return apiRequest(`/api/resumes/${resumeId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", user?.id] });
      setSelectedResume(null);
      toast({
        title: "Resume Deleted",
        description: "Resume has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title for your resume.",
        variant: "destructive",
      });
      return;
    }

    generateResume.mutate({
      userId: user?.id,
      title: title.trim(),
      targetRole: targetRole.trim() || undefined,
      template,
    });
  };

  const handleDelete = (resumeId: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteResume.mutate(resumeId);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">AI Resume Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create professional resumes tailored to specific roles using your profile data. 
          Choose from multiple templates and get AI-optimized content.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generate Resume Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Generate New Resume
              </CardTitle>
              <CardDescription>
                Create a customized resume for your target role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Resume Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Software Engineer Resume"
                    data-testid="input-resume-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role (Optional)</Label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Developer, Product Manager"
                    data-testid="input-target-role"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template Style</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={generateResume.isPending}
                  data-testid="button-generate-resume"
                >
                  {generateResume.isPending ? (
                    "Generating Resume..."
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate AI Resume
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resume List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>
                Generated resumes ({Array.isArray(resumes) ? resumes.length : 0})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResumes ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : Array.isArray(resumes) && resumes.length > 0 ? (
                <div className="space-y-3">
                  {(resumes as any[]).map((resume: any) => (
                    <div
                      key={resume.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedResume?.id === resume.id ? 'border-purple-600 bg-purple-50' : 'hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{resume.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {resume.template}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(resume.createdAt)}
                            </span>
                          </div>
                          {resume.targetRole && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {resume.targetRole}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(resume.id);
                          }}
                          disabled={deleteResume.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  No resumes yet. Generate your first one!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resume Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resume Preview</CardTitle>
                  <CardDescription>
                    {selectedResume ? selectedResume.title : "Select a resume to preview"}
                  </CardDescription>
                </div>
                {selectedResume && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Full View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedResume ? (
                <div className="space-y-6">
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="mt-4">
                      <div className="space-y-6 max-h-96 overflow-y-auto">
                        {/* Personal Info */}
                        {selectedResume.content.personalInfo && (
                          <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                              <User className="h-4 w-4" />
                              Personal Information
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-lg">
                                {selectedResume.content.personalInfo.name}
                              </h4>
                              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                {selectedResume.content.personalInfo.email && (
                                  <p>Email: {selectedResume.content.personalInfo.email}</p>
                                )}
                                {selectedResume.content.personalInfo.phone && (
                                  <p>Phone: {selectedResume.content.personalInfo.phone}</p>
                                )}
                                {selectedResume.content.personalInfo.location && (
                                  <p>Location: {selectedResume.content.personalInfo.location}</p>
                                )}
                                {selectedResume.content.personalInfo.linkedin && (
                                  <p>LinkedIn: {selectedResume.content.personalInfo.linkedin}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {selectedResume.content.summary && (
                          <div>
                            <h3 className="font-semibold mb-3">Professional Summary</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {selectedResume.content.summary}
                            </p>
                          </div>
                        )}

                        {/* Experience */}
                        {selectedResume.content.experience && selectedResume.content.experience.length > 0 && (
                          <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                              <Briefcase className="h-4 w-4" />
                              Work Experience
                            </h3>
                            <div className="space-y-4">
                              {selectedResume.content.experience.map((exp: any, index: number) => (
                                <div key={index} className="border-l-2 border-blue-200 pl-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{exp.position}</h4>
                                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {exp.duration}
                                    </Badge>
                                  </div>
                                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                      {exp.responsibilities.map((resp: string, rIndex: number) => (
                                        <li key={rIndex} className="flex items-start gap-2">
                                          <span className="text-xs mt-1.5">•</span>
                                          <span>{resp}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {selectedResume.content.skills && selectedResume.content.skills.length > 0 && (
                          <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                              <Code className="h-4 w-4" />
                              Skills
                            </h3>
                            <div className="space-y-3">
                              {selectedResume.content.skills.map((skillGroup: any, index: number) => (
                                <div key={index}>
                                  <h4 className="font-medium text-sm mb-2">{skillGroup.category}</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {skillGroup.items.map((skill: string, sIndex: number) => (
                                      <Badge key={sIndex} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sections" className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Personal Info</p>
                          <p className="text-xs text-muted-foreground">Contact details</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Experience</p>
                          <p className="text-xs text-muted-foreground">Work history</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <GraduationCap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Education</p>
                          <p className="text-xs text-muted-foreground">Academic background</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Skills</p>
                          <p className="text-xs text-muted-foreground">Technical & soft skills</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a resume from the list to preview its content
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