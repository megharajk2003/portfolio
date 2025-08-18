import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Briefcase, GraduationCap, Cog, 
  FolderOpen, Award 
} from "lucide-react";

interface SectionManagementProps {
  userId: string;
}

const sections = [
  {
    key: "personal",
    label: "Personal Details",
    description: "Name, contact, photo",
    icon: User,
  },
  {
    key: "work",
    label: "Work Experience",
    description: "2 positions added",
    icon: Briefcase,
  },
  {
    key: "skills",
    label: "Skills",
    description: "12 skills with ratings",
    icon: Cog,
  },
  {
    key: "projects",
    label: "Projects",
    description: "5 projects showcased",
    icon: FolderOpen,
  },
  {
    key: "education",
    label: "Education",
    description: "B.E. Computer Science",
    icon: GraduationCap,
  },
  {
    key: "certifications",
    label: "Certifications",
    description: "Add your certifications",
    icon: Award,
  },
];

export default function SectionManagement({ userId }: SectionManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sectionSettings = [] } = useQuery({
    queryKey: ["/api/section-settings", userId],
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionName, isVisible }: { sectionName: string; isVisible: boolean }) => {
      return apiRequest("PATCH", `/api/section-settings/${userId}/${sectionName}`, {
        isVisible,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/section-settings", userId] });
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

  const getSectionCompletionStatus = (sectionKey: string) => {
    // Mock completion status - in real app this would be calculated from actual data
    const mockStatuses: Record<string, boolean> = {
      personal: true,
      work: true,
      skills: true,
      projects: true,
      education: true,
      certifications: false,
    };
    return mockStatuses[sectionKey] || false;
  };

  const handleToggleSection = (sectionKey: string, isVisible: boolean) => {
    updateSectionMutation.mutate({ sectionName: sectionKey, isVisible });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Portfolio Sections</CardTitle>
          <span className="text-sm text-gray-500">Toggle visibility</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map((section) => {
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
  );
}
