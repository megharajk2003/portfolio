import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

import { AddContentModal } from "@/components/add-content-modal";
import { SectionManager } from "@/components/section-manager";
import Sidebar from "@/components/sidebar"; // Assuming sidebar component path

import {
  Save,
  Award,
  BookOpen,
  Building,
  GraduationCap,
  Trophy,
  Plus,
  Star,
  Menu, // Added for mobile toggle
  Bell, // Added for header consistency
} from "lucide-react";

// Simple form schemas that match your JSON structure
const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  roleOrTitle: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  summary: z
    .string()
    .min(50, "Summary must be at least 50 characters")
    .optional(),
  nationality: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

interface SectionEntry {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  organization?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string[];
  skills?: string[];
  isVisible?: boolean;
}

// Suggestions data
const suggestions = {
  skills: {
    technical: ["Python", "JavaScript", "React", "Node.js", "TypeScript"],
  },
  certifications: [
    "Digital Marketing Certification - Google",
    "AWS Cloud Practitioner",
    "Certified Scrum Master",
  ],
  achievements: [
    "Winner of National Marketing Case Competition 2021",
    "Best Employee Award",
    "Published Research Paper",
  ],
  interests: ["Photography", "Travel Blogging", "Public Speaking", "Sports"],
};

export default function Academicdetails() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [sections, setSections] = useState({
    education: [] as SectionEntry[],
    workExperience: [] as SectionEntry[],
    internships: [] as SectionEntry[],
    projects: [] as SectionEntry[],
    skills: {
      technical: [] as SectionEntry[],
      domainSpecific: [] as SectionEntry[],
      soft: [] as SectionEntry[],
      tools: [] as SectionEntry[],
    },
    certifications: [] as SectionEntry[],
    organizations: [] as SectionEntry[],
    achievements: [] as SectionEntry[],
    publications: [] as SectionEntry[],
    volunteerExperience: [] as SectionEntry[],
    interests: [] as SectionEntry[],
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const personalForm = useForm<PersonalDetailsData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: "",
      roleOrTitle: "",
      dob: "",
      summary: "",
      nationality: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const userId = Number(user?.id);
      if (isNaN(userId)) {
        throw new Error("User ID is invalid.");
      }

      const comprehensiveProfile = {
        userId,
        personalDetails: {
          ...personalForm.getValues(),
          location: {
            city: personalForm.getValues().city,
            state: personalForm.getValues().state,
            country: personalForm.getValues().country,
            pincode: personalForm.getValues().pincode,
          },
          languagesKnown: sections.interests.map((i) => i.title),
        },
        otherDetails: {
          education: sections.education.map((e) => ({
            level: e.subtitle || "Undergraduate",
            institution: e.title,
            degree: e.description || "",
            yearOfPassing: parseInt(e.year || "2024"),
            gradeOrScore: "First Class",
          })),
          workExperience: sections.workExperience.map((w) => ({
            organization: w.organization || w.title,
            roleOrPosition: w.title,
            startDate: w.startDate || "2023-01",
            endDate: w.endDate,
            responsibilities: w.responsibilities || [w.description || ""],
            skillsOrToolsUsed: w.skills || [],
          })), // ... mapping for other sections remains the same
        },
        portfolioTheme: "modern",
        isPublic: false,
      };

      return apiRequest("POST", "/api/profile", comprehensiveProfile);
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: "Your comprehensive profile has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  }); // All handler functions (handleSaveProfile, handleAddEntry, etc.) remain unchanged

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      await saveProfileMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEntry = (
    sectionKey: keyof typeof sections,
    subsection?: string
  ) => {
    const newEntry = {
      id: `${sectionKey}-${subsection || ""}-${Date.now()}`,
      title: "New Entry",
      isVisible: true,
    };

    if (sectionKey === "skills" && subsection) {
      setSections((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [subsection]: [...(prev.skills as any)[subsection], newEntry],
        },
      }));
    } else {
      setSections((prev) => ({
        ...prev,
        [sectionKey]: [...(prev[sectionKey] as SectionEntry[]), newEntry],
      }));
    }
  };

  const handleDeleteEntry = (
    sectionKey: keyof typeof sections,
    entryId: string,
    subsection?: string
  ) => {
    if (sectionKey === "skills" && subsection) {
      setSections((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [subsection]: (prev.skills as any)[subsection].filter(
            (entry: SectionEntry) => entry.id !== entryId
          ),
        },
      }));
    } else {
      setSections((prev) => ({
        ...prev,
        [sectionKey]: (prev[sectionKey] as SectionEntry[]).filter(
          (entry: SectionEntry) => entry.id !== entryId
        ),
      }));
    }
  };

  const handleSelectSuggestion = (
    sectionKey: keyof typeof sections,
    suggestion: string,
    subsection?: string
  ) => {
    const newEntry = {
      id: `${sectionKey}-${subsection || ""}-${Date.now()}`,
      title: suggestion,
      isVisible: true,
    };

    if (sectionKey === "skills" && subsection) {
      setSections((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [subsection]: [...(prev.skills as any)[subsection], newEntry],
        },
      }));
    } else {
      setSections((prev) => ({
        ...prev,
        [sectionKey]: [...(prev[sectionKey] as SectionEntry[]), newEntry],
      }));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    // This function logic remains the same
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar overlay */}     {" "}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
            {/* Sidebar */}     {" "}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 
        `}
      >
                <Sidebar onClose={() => setSidebarOpen(false)} />     {" "}
      </div>
            {/* Main content */}     {" "}
      <main className="lg:ml-64 min-h-screen">
                {/* Header */}       {" "}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
                   {" "}
          <div className="flex justify-between items-center">
                       {" "}
            <div className="flex items-center space-x-4">
                           {" "}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                                <Menu className="h-5 w-5" />             {" "}
              </Button>
                           {" "}
              <div>
                               {" "}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    Profile Details                {" "}
                </h2>
                               {" "}
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                                    Manage your academic and professional
                  information.                {" "}
                </p>
                             {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            <div className="flex items-center space-x-2 sm:space-x-4">
                           {" "}
              <div className="relative">
                               {" "}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                                    <Bell className="h-5 w-5" />               
                   {" "}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        3                  {" "}
                  </span>
                                 {" "}
                </Button>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </header>
               {" "}
        <div className="p-4 sm:p-6 lg:p-8">
                   {" "}
          <div className="space-y-6">
                        {/* All your SectionManager components go here */}
                       {" "}
            <SectionManager
              title="Education"
              icon={<GraduationCap className="h-5 w-5" />}
              entries={sections.education}
              onAddEntry={() => handleAddEntry("education")}
              onDeleteEntry={(id) => handleDeleteEntry("education", id)}
            />
                       {" "}
            <SectionManager
              title="Technical Skills"
              icon={<Award className="h-5 w-5" />}
              entries={sections.skills.technical}
              onAddEntry={() => handleAddEntry("skills", "technical")}
              onDeleteEntry={(id) =>
                handleDeleteEntry("skills", id, "technical")
              }
              suggestions={suggestions.skills.technical}
              onSelectSuggestion={(suggestion) =>
                handleSelectSuggestion("skills", suggestion, "technical")
              }
              showSuggestions={true}
            />
                        {/* ... other SectionManager components ... */}         
              {/* Add Content Button */}           {" "}
            <div className="flex justify-center pt-6">
                           {" "}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAddContentModal(true)}
                className="flex items-center space-x-2"
              >
                                <Plus className="h-5 w-5" />               {" "}
                <span>Add Content</span>             {" "}
              </Button>
                         {" "}
            </div>
                     {" "}
          </div>
        </div>
        {/* Save Button */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            onClick={handleSaveProfile}
            disabled={isSubmitting}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Complete Profile
              </>
            )}
          </Button>
        </div>
        {/* Add Content Modal */}
        <AddContentModal
          open={showAddContentModal}
          onClose={() => setShowAddContentModal(false)}
          onSelectCategory={handleSelectCategory}
        />
      </main>
    </div>
  );
}
