import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { X, AlertTriangle, User, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProfileData {
  profile?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  skills?: any[];
  projects?: any[];
  workExperience?: any[];
  education?: any[];
}

function calculateProfileCompletion(data: ProfileData): {
  percentage: number;
  missingFields: string[];
} {
  const requiredFields = [
    { key: "profile.name", label: "Full Name", value: data.profile?.name },
    {
      key: "profile.role",
      label: "Professional Role",
      value: data.profile?.role,
    },
    { key: "profile.phone", label: "Phone Number", value: data.profile?.phone },
    {
      key: "profile.location",
      label: "Location",
      value: data.profile?.location,
    },
    {
      key: "profile.summary",
      label: "Professional Summary",
      value: data.profile?.summary,
    },
  ];

  const optionalFields = [
    {
      key: "skills",
      label: "Skills",
      value: (data.skills as any[])?.length > 0,
    },
    {
      key: "projects",
      label: "Projects",
      value: (data.projects as any[])?.length > 0,
    },
    {
      key: "workExperience",
      label: "Work Experience",
      value: (data.workExperience as any[])?.length > 0,
    },
    {
      key: "education",
      label: "Education",
      value: (data.education as any[])?.length > 0,
    },
  ];

  const allFields = [...requiredFields, ...optionalFields];
  const completedFields = allFields.filter((field) => field.value).length;
  const percentage = Math.round((completedFields / allFields.length) * 100);

  const missingRequired = requiredFields
    .filter((field) => !field.value)
    .map((field) => field.label);
  const missingOptional = optionalFields
    .filter((field) => !field.value)
    .map((field) => field.label);

  return {
    percentage,
    missingFields: [...missingRequired, ...missingOptional],
  };
}

export default function ProfileCompletionNotification() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const { data: profile } = useQuery({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  const { data: skills } = useQuery({
    queryKey: ["/api/skills", userId],
    enabled: !!userId,
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects", userId],
    enabled: !!userId,
  });

  const { data: workExperience } = useQuery({
    queryKey: ["/api/work-experience", userId],
    enabled: !!userId,
  });

  const { data: education } = useQuery({
    queryKey: ["/api/education", userId],
    enabled: !!userId,
  });

  if (!userId || isDismissed) return null;

  const profileData: ProfileData = {
    profile: profile as any,
    skills: skills as any[],
    projects: projects as any[],
    workExperience: workExperience as any[],
    education: education as any[],
  };

  const { percentage, missingFields } = calculateProfileCompletion(profileData);

  // Don't show notification if profile is complete (100%)
  if (percentage >= 100) return null;

  // Show different styles based on completion level
  const isMinimallyComplete = percentage >= 50;
  const variant = isMinimallyComplete ? "default" : "destructive";

  return (
    <Card
      className={`mb-6 border-l-4 ${
        isMinimallyComplete ? "border-l-yellow-500" : "border-l-red-500"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              className={`p-2 rounded-full ${
                isMinimallyComplete
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isMinimallyComplete ? (
                <User className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isMinimallyComplete
                  ? "Complete Your Profile"
                  : "Profile Setup Required"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isMinimallyComplete
                  ? "Add more details to make your profile stand out to employers."
                  : "Complete your profile to unlock all features and improve your visibility."}
              </p>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Completion
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {percentage}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={`h-2 ${
                    isMinimallyComplete ? "bg-yellow-100" : "bg-red-100"
                  }`}
                />
              </div>

              {missingFields.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Missing Information:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {missingFields.slice(0, 4).map((field, index) => (
                      <span
                        key={index}
                        className={`inline-block px-2 py-1 text-xs rounded-md ${
                          isMinimallyComplete
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {field}
                      </span>
                    ))}
                    {missingFields.length > 4 && (
                      <span className="inline-block px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600">
                        +{missingFields.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Link href="/profile">
                  <Button size="sm" data-testid="button-complete-profile">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDismissed(true)}
                  data-testid="button-dismiss-notification"
                >
                  Remind Me Later
                </Button>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-gray-500 hover:text-gray-700"
            data-testid="button-close-notification"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
