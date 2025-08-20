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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";
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
  Calendar,
  Star,
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

const contactDetailsSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  githubOrPortfolio: z.string().optional(),
  website: z.string().optional(),
  twitter: z.string().optional(),
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;
type ContactDetailsData = z.infer<typeof contactDetailsSchema>;

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

interface SimpleComprehensiveFormProps {
  onSuccess?: () => void;
}

// Suggestions data
const suggestions = {
  skills: {
    technical: [
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
    ],
    domainSpecific: [
      "Marketing Strategy",
      "Business Analysis",
      "Healthcare Diagnostics",
      "Teaching",
      "Data Science",
    ],
    soft: [
      "Leadership",
      "Communication",
      "Problem Solving",
      "Team Collaboration",
      "Critical Thinking",
    ],
    tools: [
      "MS Office",
      "Jira",
      "Canva",
      "Power BI",
      "SPSS",
      "Adobe Illustrator",
      "Figma",
      "Slack",
    ],
  },
  certifications: [
    "Digital Marketing Certification - Google",
    "AWS Cloud Practitioner",
    "Certified Scrum Master",
    "Google Analytics Certified",
    "CompTIA Security+",
  ],
  achievements: [
    "Winner of National Marketing Case Competition 2021",
    "Best Employee Award",
    "Top Performer in Training Program",
    "Published Research Paper",
    "Led Successful Project Launch",
  ],
  interests: [
    "Photography",
    "Travel Blogging",
    "Public Speaking",
    "Sports",
    "Theatre",
    "Reading",
    "Cooking",
    "Music",
    "Volunteering",
    "Technology",
  ],
};

export default function SimpleComprehensiveForm({
  onSuccess,
}: SimpleComprehensiveFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
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
  const userId = user?.id;

  // Fetch existing profile data to autofill
  const { data: existingProfile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  // Fetch existing education data
  const { data: existingEducation = [] } = useQuery({
    queryKey: ["/api/education", userId],
    enabled: !!userId,
  });

  // Fetch existing work experience data
  const { data: existingWorkExperience = [] } = useQuery({
    queryKey: ["/api/work-experience", userId],
    enabled: !!userId,
  });

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

  const contactForm = useForm<ContactDetailsData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email: "",
      phone: "",
      linkedin: "",
      githubOrPortfolio: "",
      website: "",
      twitter: "",
    },
  });

  // Initialize forms with existing data
  useEffect(() => {
    if (user || existingProfile) {
      const profile = existingProfile;

      // Autofill personal details
      if (profile?.personalDetails) {
        const personalDetails = profile.personalDetails;
        personalForm.reset({
          fullName:
            personalDetails.fullName ||
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          roleOrTitle: personalDetails.roleOrTitle || "",
          dob: personalDetails.dob || "",
          gender: personalDetails.gender,
          summary: personalDetails.summary || "",
          nationality: personalDetails.nationality || "",
          city: personalDetails.location?.city || "",
          state: personalDetails.location?.state || "",
          country: personalDetails.location?.country || "",
          pincode: personalDetails.location?.pincode || "",
        });
      } else if (user) {
        personalForm.setValue(
          "fullName",
          `${user.firstName || ""} ${user.lastName || ""}`.trim()
        );
      }

      // Autofill contact details
      if (profile?.contactDetails) {
        const contactDetails = profile.contactDetails;
        contactForm.reset({
          email: contactDetails.email || user?.email || "",
          phone: contactDetails.phone || "",
          linkedin: contactDetails.linkedin || "",
          githubOrPortfolio: contactDetails.githubOrPortfolio || "",
          website: contactDetails.website || "",
          twitter: contactDetails.twitter || "",
        });
      } else if (user) {
        contactForm.setValue("email", user.email || "");
      }

      // Autofill other details sections
      if (profile?.otherDetails) {
        const otherDetails = profile.otherDetails;

        setSections((prev) => ({
          ...prev,
          education: (otherDetails.education || []).map(
            (edu: any, index: number) => ({
              id: edu.id || `education-${index}`,
              title: edu.institution,
              subtitle: edu.level,
              description: edu.degree,
              year: edu.yearOfPassing?.toString(),
              isVisible: true,
            })
          ),
          workExperience: (otherDetails.workExperience || []).map(
            (exp: any, index: number) => ({
              id: exp.id || `work-${index}`,
              title: exp.roleOrPosition,
              organization: exp.organization,
              startDate: exp.startDate,
              endDate: exp.endDate,
              responsibilities: exp.responsibilities,
              skills: exp.skillsOrToolsUsed,
              isVisible: true,
            })
          ),
          skills: {
            technical: (otherDetails.skills?.technical || []).map(
              (skill: string, index: number) => ({
                id: `tech-${index}`,
                title: skill,
                isVisible: true,
              })
            ),
            domainSpecific: (otherDetails.skills?.domainSpecific || []).map(
              (skill: string, index: number) => ({
                id: `domain-${index}`,
                title: skill,
                isVisible: true,
              })
            ),
            soft: (otherDetails.skills?.soft || []).map(
              (skill: string, index: number) => ({
                id: `soft-${index}`,
                title: skill,
                isVisible: true,
              })
            ),
            tools: (otherDetails.skills?.tools || []).map(
              (skill: string, index: number) => ({
                id: `tool-${index}`,
                title: skill,
                isVisible: true,
              })
            ),
          },
          certifications: (otherDetails.certifications || []).map(
            (cert: any, index: number) => ({
              id: cert.id || `cert-${index}`,
              title: cert.title,
              organization: cert.organization,
              year: cert.year?.toString(),
              isVisible: true,
            })
          ),
          projects: (otherDetails.projects || []).map(
            (project: any, index: number) => ({
              id: project.id || `project-${index}`,
              title: project.title,
              description: project.description,
              subtitle: project.domain,
              skills: project.toolsOrMethods,
              isVisible: true,
            })
          ),
          achievements: (otherDetails.achievements || []).map(
            (achievement: string, index: number) => ({
              id: `achievement-${index}`,
              title: achievement,
              isVisible: true,
            })
          ),
          // Add other sections as needed
        }));
      }
    }
  }, [user, existingProfile, personalForm, contactForm]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const userId = Number(user?.id);
      if (isNaN(userId)) {
        throw new Error("User ID is invalid.");
      }

      // Build comprehensive profile matching your JSON structure
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
        contactDetails: {
          ...contactForm.getValues(),
          otherProfiles: {
            // Can be expanded later
          },
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
          })),
          internships: sections.internships.map((i) => ({
            organization: i.organization || i.title,
            roleOrPosition: i.title,
            startDate: i.startDate || "2023-01",
            endDate: i.endDate || "2023-06",
            projectsOrTasks: [i.description || ""],
            skillsOrToolsUsed: i.skills || [],
          })),
          projects: sections.projects.map((p) => ({
            title: p.title,
            description: p.description || "",
            domain: p.subtitle || "Technology",
            toolsOrMethods: p.skills || [],
            outcome: "Successfully completed",
          })),
          skills: {
            technical: sections.skills.technical.map((s) => s.title),
            domainSpecific: sections.skills.domainSpecific.map((s) => s.title),
            soft: sections.skills.soft.map((s) => s.title),
            tools: sections.skills.tools.map((s) => s.title),
          },
          certifications: sections.certifications.map((c) => {
            const parts = c.title.split(" - ");
            return {
              title: parts[0] || c.title,
              organization: parts[1] || "Unknown",
              year: parseInt(c.year || "2024"),
            };
          }),
          organizations: sections.organizations.map((o) => ({
            name: o.title,
            role: o.subtitle || "Member",
            year: o.year || "2023-2024",
            contribution: o.description || "Active participation",
          })),
          achievements: sections.achievements.map((a) => a.title),
          publicationsOrCreativeWorks: sections.publications.map((p) => ({
            title: p.title,
            type: "Article",
            journalOrPlatform: p.organization || "Unknown",
            year: parseInt(p.year || "2024"),
          })),
          volunteerExperience: sections.volunteerExperience.map((v) => ({
            organization: v.organization || v.title,
            role: v.subtitle || "Volunteer",
            description: v.description || "",
            year: v.year || "2023-2024",
          })),
          interestsOrHobbies: sections.interests.map((i) => i.title),
        },
        portfolioTheme: "modern",
        isPublic: false,
      };

      // Use PUT for upsert functionality
      return apiRequest("PUT", "/api/profile", comprehensiveProfile);
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/education", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/work-experience", userId],
      });

      toast({
        title: "Profile Saved",
        description: "Your comprehensive profile has been saved successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    switch (categoryId) {
      case "skills":
        handleAddEntry("skills", "technical");
        break;
      case "education":
        handleAddEntry("education");
        break;
      case "experience":
        handleAddEntry("workExperience");
        break;
      case "certificates":
        handleAddEntry("certifications");
        break;
      case "awards":
        handleAddEntry("achievements");
        break;
      case "projects":
        handleAddEntry("projects");
        break;
      case "internship":
        handleAddEntry("internships");
        break;
      case "organizations":
        handleAddEntry("organizations");
        break;
      case "publications":
        handleAddEntry("publications");
        break;
      case "interests":
        handleAddEntry("interests");
        break;
      default:
        toast({
          title: "Coming Soon",
          description: `${categoryId} section will be available soon.`,
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          {
            id: "personal",
            label: "Personal Details",
            icon: <User className="h-4 w-4" />,
          },
          {
            id: "contact",
            label: "Contact Details",
            icon: <Mail className="h-4 w-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeSection === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Personal Details Section */}
      {activeSection === "personal" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...personalForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={personalForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="roleOrTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Professional Summary *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a brief professional summary highlighting your expertise..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        {field.value?.length || 0} characters (minimum 50)
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Contact Details Section */}
      {activeSection === "contact" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Contact Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...contactForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={contactForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contactForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91-XXXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contactForm.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/in/username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contactForm.control}
                  name="githubOrPortfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub / Portfolio URL</FormLabel>
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
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
