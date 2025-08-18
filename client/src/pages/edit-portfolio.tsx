import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Briefcase, GraduationCap, Cog, FolderOpen, Award } from "lucide-react";

const CURRENT_USER_ID = "user-1";

const portfolioSections = [
  { key: "personal", label: "Personal Details", icon: User, description: "Name, contact, photo" },
  { key: "work", label: "Work Experience", icon: Briefcase, description: "Professional experience" },
  { key: "education", label: "Education", icon: GraduationCap, description: "Academic background" },
  { key: "skills", label: "Skills", icon: Cog, description: "Technical and soft skills" },
  { key: "projects", label: "Projects", icon: FolderOpen, description: "Portfolio projects" },
  { key: "certifications", label: "Certifications", icon: Award, description: "Professional certifications" },
];

export default function EditPortfolio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sectionSettings = [] } = useQuery({
    queryKey: ["/api/section-settings", CURRENT_USER_ID],
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionName, isVisible }: { sectionName: string; isVisible: boolean }) => {
      return apiRequest("PATCH", `/api/section-settings/${CURRENT_USER_ID}/${sectionName}`, {
        isVisible,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/section-settings", CURRENT_USER_ID] });
      toast({
        title: "Section updated",
        description: "Portfolio section visibility updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update section visibility.",
        variant: "destructive",
      });
    },
  });

  const getSectionSettings = (sectionKey: string) => {
    const setting = sectionSettings.find(s => s.sectionName === sectionKey);
    return setting ? setting.isVisible : true;
  };

  const handleToggleSection = (sectionKey: string, isVisible: boolean) => {
    updateSectionMutation.mutate({ sectionName: sectionKey, isVisible });
  };

  const getSectionCompletionStatus = (sectionKey: string) => {
    // Mock completion status - in real app this would be calculated from actual data
    const mockStatuses: Record<string, boolean> = {
      personal: true,
      work: true,
      education: true,
      skills: true,
      projects: true,
      certifications: false,
    };
    return mockStatuses[sectionKey] || false;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Portfolio</h1>
            <p className="text-gray-600 mt-1">Toggle section visibility and manage your portfolio</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/portfolio">
              <Button variant="outline">Portfolio Settings</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Portfolio Sections
              <span className="text-sm font-normal text-gray-500">Toggle visibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioSections.map((section) => {
                const isVisible = getSectionSettings(section.key);
                const isComplete = getSectionCompletionStatus(section.key);
                const IconComponent = section.icon;

                return (
                  <div
                    key={section.key}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-gray-900">{section.label}</h4>
                        <p className="text-sm text-gray-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={isComplete ? "default" : "secondary"}>
                        {isComplete ? "Complete" : "Empty"}
                      </Badge>
                      <Switch
                        checked={isVisible}
                        onCheckedChange={(checked) => handleToggleSection(section.key, checked)}
                        disabled={updateSectionMutation.isPending}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/portfolio/megharaj">
              Preview Portfolio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
