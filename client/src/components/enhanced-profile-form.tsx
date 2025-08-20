import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProfileSchema, profiles } from "@shared/schema";
import { SectionManager } from "./section-manager";
import { AddContentModal } from "./add-content-modal";
import {
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Github,
  Linkedin,
  Globe,
  Award,
  BookOpen,
  Building,
  Users,
  GraduationCap,
  Trophy,
  Plus,
  Briefcase,
} from "lucide-react";

type Profile = typeof profiles.$inferSelect;

const basicProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  role: z
    .string()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be less than 100 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be less than 20 characters"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  summary: z
    .string()
    .min(50, "Summary must be at least 50 characters")
    .max(500, "Summary must be less than 500 characters"),
  email: z.string().email("Invalid email address").optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Invalid Portfolio URL")
    .optional()
    .or(z.literal("")),
});

type BasicProfileData = z.infer<typeof basicProfileSchema>;

interface SectionEntry {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  isVisible?: boolean;
}

interface EnhancedProfileFormProps {
  onSuccess?: () => void;
  showCompactMode?: boolean;
}

// Predefined suggestions for different categories
const suggestions = {
  skills: [
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "TypeScript",
    "Java",
    "C++",
    "HTML/CSS",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Git",
    "Machine Learning",
    "Data Analysis",
    "Project Management",
    "Leadership",
  ],
  languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "Arabic",
    "Portuguese",
    "Russian",
    "Italian",
    "Dutch",
    "Tamil",
  ],
  certificates: [
    "AWS Cloud Practitioner",
    "Google Cloud Associate",
    "Microsoft Azure Fundamentals",
    "Certified Scrum Master",
    "PMP",
    "CompTIA Security+",
    "Cisco CCNA",
    "Google Analytics",
    "HubSpot Content Marketing",
    "Salesforce Administrator",
  ],
};

export default function EnhancedProfileForm({
  onSuccess,
  showCompactMode = false,
}: EnhancedProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [sections, setSections] = useState({
    education: [] as SectionEntry[],
    skills: [] as SectionEntry[],
    languages: [] as SectionEntry[],
    certificates: [] as SectionEntry[],
    achievements: [] as SectionEntry[],
    projects: [] as SectionEntry[],
    experience: [] as SectionEntry[],
    organizations: [] as SectionEntry[],
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;

  const { data: existingProfile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  const form = useForm<BasicProfileData>({
    resolver: zodResolver(basicProfileSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
    },
  });

  // Update form when user data or existing profile loads
  useEffect(() => {
    if (user || existingProfile) {
      const profile = existingProfile as Profile;
      const formData: Partial<BasicProfileData> = {
        name:
          profile?.personalDetails?.fullName ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        role: profile?.personalDetails?.roleOrTitle || "",
        email: profile?.contactDetails?.email || user?.email || "",
        phone: profile?.contactDetails?.phone || "",
        location: profile?.personalDetails?.location?.city || "",
        summary: profile?.personalDetails?.summary || "",
        githubUrl: profile?.contactDetails?.githubOrPortfolio || "",
        linkedinUrl: profile?.contactDetails?.linkedin || "",
        portfolioUrl: profile?.contactDetails?.website || "",
      };

      if (!form.formState.isDirty) {
        form.reset(formData);
      }

      // Load existing sections data
      if (profile) {
        const skills = profile.otherDetails?.skills;
        const languages = profile.personalDetails?.languagesKnown;

        setSections((prev) => ({
          ...prev,
          skills:
            skills && typeof skills === "object"
              ? Object.values(skills)
                  .flat()
                  .map((skill: any, index: number) => ({
                    id: `skill-${index}`,
                    title: typeof skill === "string" ? skill : String(skill),
                    isVisible: true,
                  }))
              : [],
          languages:
            languages && Array.isArray(languages)
              ? languages.map((lang: string, index: number) => ({
                  id: `language-${index}`,
                  title: lang,
                  isVisible: true,
                }))
              : [],
          // Add more section data parsing as needed
        }));
      }
    }
  }, [user, existingProfile, form]);

  const createProfileMutation = useMutation({
    mutationFn: (data: BasicProfileData) => {
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        throw new Error("User ID is invalid.");
      }

      // Structure the data according to the profile schema
      const profileData = {
        userId: numericUserId,
        personalDetails: {
          fullName: data.name,
          roleOrTitle: data.role,
          summary: data.summary,
          languagesKnown: sections.languages.map((l: SectionEntry) => l.title),
        },
        contactDetails: {
          email: data.email,
          phone: data.phone,
          linkedin: data.linkedinUrl,
          githubOrPortfolio: data.githubUrl,
          website: data.portfolioUrl,
        },
        otherDetails: {
          skills: {
            technical: sections.skills.map((s: SectionEntry) => s.title),
          },
          achievements: sections.achievements.map((a: SectionEntry) => a.title),
          certifications: sections.certificates.map(
            (c: SectionEntry) => c.title
          ),
          organizations: sections.organizations.map(
            (o: SectionEntry) => o.title
          ),
        },
      };

      return apiRequest("POST", "/api/profile", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<BasicProfileData>) => {
      // Structure the data according to the profile schema
      const profileData = {
        personalDetails: {
          fullName: data.name,
          roleOrTitle: data.role,
          summary: data.summary,
          languagesKnown: sections.languages.map((l: SectionEntry) => l.title),
        },
        contactDetails: {
          email: data.email,
          phone: data.phone,
          linkedin: data.linkedinUrl,
          githubOrPortfolio: data.githubUrl,
          website: data.portfolioUrl,
        },
        otherDetails: {
          skills: {
            technical: sections.skills.map((s: SectionEntry) => s.title),
          },
          achievements: sections.achievements.map((a: SectionEntry) => a.title),
          certifications: sections.certificates.map(
            (c: SectionEntry) => c.title
          ),
          organizations: sections.organizations.map(
            (o: SectionEntry) => o.title
          ),
        },
      };

      return apiRequest("PATCH", `/api/profile/${userId}`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: BasicProfileData) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingProfile) {
        await updateProfileMutation.mutateAsync(data);
      } else {
        await createProfileMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEntry = (sectionKey: keyof typeof sections) => {
    const newEntry = {
      id: `${sectionKey}-${Date.now()}`,
      title: "New Entry",
      isVisible: true,
    };

    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], newEntry],
    }));
  };

  const handleDeleteEntry = (
    sectionKey: keyof typeof sections,
    entryId: string
  ) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((entry) => entry.id !== entryId),
    }));
  };

  const handleSelectSuggestion = (
    sectionKey: keyof typeof sections,
    suggestion: string
  ) => {
    const newEntry = {
      id: `${sectionKey}-${Date.now()}`,
      title: suggestion,
      isVisible: true,
    };

    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], newEntry],
    }));
  };

  const handleSelectCategory = (categoryId: string) => {
    // Handle different category selections
    switch (categoryId) {
      case "skills":
        handleAddEntry("skills");
        break;
      case "education":
        handleAddEntry("education");
        break;
      case "languages":
        handleAddEntry("languages");
        break;
      case "certificates":
        handleAddEntry("certificates");
        break;
      case "awards":
        handleAddEntry("achievements");
        break;
      case "projects":
        handleAddEntry("projects");
        break;
      case "experience":
        handleAddEntry("experience");
        break;
      case "organizations":
        handleAddEntry("organizations");
        break;
      default:
        toast({
          title: "Coming Soon",
          description: `${categoryId} section will be available soon.`,
        });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Profile Information */}
      <Card className={showCompactMode ? "" : "max-w-4xl mx-auto"}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Full Name *</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Professional Role *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Full Stack Developer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Address</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          type="email"
                          {...field}
                          disabled={!!user?.email}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone Number *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location *</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="City, State, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Github className="h-4 w-4" />
                        <span>GitHub URL</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Professional Summary *</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a brief professional summary highlighting your experience, skills, and career goals..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        {field.value?.length || 0} / 500 characters (minimum 50)
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {existingProfile ? "Update Profile" : "Save Profile"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Portfolio Sections */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <SectionManager
          title="Education"
          icon={<GraduationCap className="h-5 w-5" />}
          entries={sections.education}
          onAddEntry={() => handleAddEntry("education")}
          onDeleteEntry={(id) => handleDeleteEntry("education", id)}
        />

        <SectionManager
          title="Skills"
          icon={<Award className="h-5 w-5" />}
          entries={sections.skills}
          onAddEntry={() => handleAddEntry("skills")}
          onDeleteEntry={(id) => handleDeleteEntry("skills", id)}
          suggestions={suggestions.skills}
          onSelectSuggestion={(suggestion) =>
            handleSelectSuggestion("skills", suggestion)
          }
          showSuggestions={true}
        />

        <SectionManager
          title="Languages"
          icon={<Globe className="h-5 w-5" />}
          entries={sections.languages}
          onAddEntry={() => handleAddEntry("languages")}
          onDeleteEntry={(id) => handleDeleteEntry("languages", id)}
          suggestions={suggestions.languages}
          onSelectSuggestion={(suggestion) =>
            handleSelectSuggestion("languages", suggestion)
          }
          showSuggestions={true}
        />

        <SectionManager
          title="Certificates"
          icon={<BookOpen className="h-5 w-5" />}
          entries={sections.certificates}
          onAddEntry={() => handleAddEntry("certificates")}
          onDeleteEntry={(id) => handleDeleteEntry("certificates", id)}
          suggestions={suggestions.certificates}
          onSelectSuggestion={(suggestion) =>
            handleSelectSuggestion("certificates", suggestion)
          }
          showSuggestions={true}
        />

        <SectionManager
          title="Achievements"
          icon={<Trophy className="h-5 w-5" />}
          entries={sections.achievements}
          onAddEntry={() => handleAddEntry("achievements")}
          onDeleteEntry={(id) => handleDeleteEntry("achievements", id)}
        />

        <SectionManager
          title="Organizations"
          icon={<Users className="h-5 w-5" />}
          entries={sections.organizations}
          onAddEntry={() => handleAddEntry("organizations")}
          onDeleteEntry={(id) => handleDeleteEntry("organizations", id)}
        />

        {/* Add Content Button */}
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAddContentModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Content</span>
          </Button>
        </div>
      </div>

      {/* Add Content Modal */}
      <AddContentModal
        open={showAddContentModal}
        onClose={() => setShowAddContentModal(false)}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  );
}
