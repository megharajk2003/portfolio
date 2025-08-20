import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/sidebar";
import SimpleComprehensiveForm from "@/components/comprehensive-profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Menu,
  Bell,
  FileText,
  Target,
  Trophy,
  Award,
  Star,
  GraduationCap,
  Building,
  Heart,
  Users,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";

// Academic schemas from the academic details page
const educationSchema = z.object({
  level: z.string().min(1, "Education level is required"),
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().optional(),
  yearOfPassing: z.number().optional(),
  gradeOrScore: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  description: z.string().optional(),
});

const certificationSchema = z.object({
  title: z.string().min(1, "Certification title is required"),
  organization: z.string().min(1, "Organization is required"),
  year: z.number().min(1900, "Valid year required").optional(),
  url: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().url().optional()),
  description: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.number().min(1).max(5, "Level must be between 1-5"),
  category: z.string().min(1, "Category is required"),
});

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  domain: z.string().min(1, "Domain is required"),
  toolsOrMethods: z.string().optional(), // Simplified to string for input
  outcome: z.string().optional(),
  url: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().url().optional()),
  githubUrl: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().url().optional()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const workExperienceSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  roleOrPosition: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  responsibilities: z.string().optional(), // Simplified to string for input
  skillsOrToolsUsed: z.string().optional(), // Simplified to string for input
  description: z.string().optional(),
});

const volunteerSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  role: z.string().min(1, "Role is required"),
  description: z.string().min(10, "Description is required"),
  year: z.string().min(1, "Year is required"),
});

const publicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum([
    "Research Paper",
    "Portfolio Work",
    "Article",
    "Book",
    "Other",
  ]),
  journalOrPlatform: z.string().min(1, "Journal/Platform is required"),
  year: z.number().min(1900, "Valid year required"),
  url: z.string().url().optional(),
});

// Schemas for personal and contact details editing
const personalDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  roleOrTitle: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  languagesKnown: z.array(z.string()).optional(),
  photo: z.string().optional(),
});

const contactDetailsSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  website: z.string().transform(val => val === "" ? undefined : val).pipe(z.string().url().optional()),
  linkedin: z.string().transform(val => val === "" ? undefined : val).pipe(z.string().url().optional()),
  githubOrPortfolio: z.string().transform(val => val === "" ? undefined : val).pipe(z.string().url().optional()),
  twitter: z.string().transform(val => val === "" ? undefined : val).pipe(z.string().url().optional()),
});

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  role: z.string().min(1, "Role is required"),
  year: z.string().min(1, "Year is required"),
  contribution: z.string().min(10, "Contribution description is required"),
});

type EducationItem = z.infer<typeof educationSchema>;
type CertificationItem = z.infer<typeof certificationSchema>;
type SkillItem = z.infer<typeof skillSchema>;
type ProjectItem = z.infer<typeof projectSchema>;
type WorkExperienceItem = z.infer<typeof workExperienceSchema>;
type VolunteerItem = z.infer<typeof volunteerSchema>;
type PublicationItem = z.infer<typeof publicationSchema>;
type OrganizationItem = z.infer<typeof organizationSchema>;

interface AcademicCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  isExpanded: boolean;
  count: number;
  items: any[];
}

// Academic data management
const getInitialCategories = (): AcademicCategory[] => [
  {
    id: "education",
    title: "Education",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Academic qualifications and degrees",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "certifications",
    title: "Certifications",
    icon: <Award className="h-5 w-5" />,
    description: "Professional certifications and achievements",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "skills",
    title: "Skills",
    icon: <Star className="h-5 w-5" />,
    description: "Technical and professional skills",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "projects",
    title: "Projects",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Academic and professional projects",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "workExperience",
    title: "Work Experience",
    icon: <Building className="h-5 w-5" />,
    description: "Professional work experience",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "publications",
    title: "Publications & Research",
    icon: <FileText className="h-5 w-5" />,
    description: "Research papers and publications",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "organizations",
    title: "Organizations",
    icon: <Users className="h-5 w-5" />,
    description: "Professional organizations and memberships",
    isExpanded: false,
    count: 0,
    items: [],
  },
  {
    id: "volunteer",
    title: "Volunteer Experience",
    icon: <Heart className="h-5 w-5" />,
    description: "Volunteer work and community service",
    isExpanded: false,
    count: 0,
    items: [],
  },
];

const suggestions = {
  education: {
    levels: [
      "High School",
      "Bachelor's Degree",
      "Master's Degree",
      "PhD",
      "Diploma",
      "Certificate",
    ],
    fields: [
      "Computer Science",
      "Engineering",
      "Business",
      "Medicine",
      "Arts",
      "Science",
    ],
  },
  skills: {
    technical: [
      "Python",
      "JavaScript",
      "React",
      "Node.js",
      "TypeScript",
      "SQL",
      "AWS",
      "Docker",
    ],
    soft: [
      "Leadership",
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Time Management",
    ],
    tools: ["Git", "Figma", "Adobe Suite", "Microsoft Office", "Slack", "Jira"],
  },
  certifications: [
    "Google Cloud Professional",
    "AWS Certified Solutions Architect",
    "Microsoft Azure Fundamentals",
    "Certified Scrum Master",
    "PMP Certification",
  ],
  domains: [
    "Technology",
    "Business",
    "Marketing",
    "Design",
    "Finance",
    "Healthcare",
    "Education",
  ],
};

// Personal Details Edit Form Component
function PersonalDetailsEditForm({
  profile,
  user,
  onCancel,
  onSave,
}: {
  profile: any;
  user: any;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: profile?.personalDetails?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "",
      roleOrTitle: profile?.personalDetails?.roleOrTitle || "",
      dob: profile?.personalDetails?.dob || "",
      gender: profile?.personalDetails?.gender || "",
      nationality: profile?.personalDetails?.nationality || "",
      location: {
        city: profile?.personalDetails?.location?.city || "",
        state: profile?.personalDetails?.location?.state || "",
        country: profile?.personalDetails?.location?.country || "",
      },
      summary: profile?.personalDetails?.summary || "",
      photo: profile?.personalDetails?.photo || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/profile/${user?.id || "user_sample_1"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalDetails: data }),
      });

      if (response.ok) {
        toast({ title: "Personal details updated successfully!" });
        onSave();
      } else {
        throw new Error("Failed to update personal details");
      }
    } catch (error) {
      toast({ title: "Error updating personal details", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit Personal Details</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleOrTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role/Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Software Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Indian, American" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Write a brief professional summary..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Contact Details Edit Form Component
function ContactDetailsEditForm({
  profile,
  user,
  onCancel,
  onSave,
}: {
  profile: any;
  user: any;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email: profile?.contactDetails?.email || user?.email || "",
      phone: profile?.contactDetails?.phone || "",
      website: profile?.contactDetails?.website || "",
      linkedin: profile?.contactDetails?.linkedin || "",
      githubOrPortfolio: profile?.contactDetails?.githubOrPortfolio || "",
      twitter: profile?.contactDetails?.twitter || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/profile/${user?.id || "user_sample_1"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactDetails: data }),
      });

      if (response.ok) {
        toast({ title: "Contact details updated successfully!" });
        onSave();
      } else {
        throw new Error("Failed to update contact details");
      }
    } catch (error) {
      toast({ title: "Error updating contact details", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Edit Contact Details</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="your.email@example.com" />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://yourwebsite.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/yourprofile" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="githubOrPortfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub/Portfolio</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://github.com/yourusername" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://twitter.com/yourusername" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Form component for adding new entries
function AddEntryForm({
  category,
  onAdd,
  onCancel,
}: {
  category: AcademicCategory;
  onAdd: (data: any) => void;
  onCancel: () => void;
}) {
  const getSchema = () => {
    switch (category.id) {
      case "education":
        return educationSchema;
      case "certifications":
        return certificationSchema;
      case "skills":
        return skillSchema;
      case "projects":
        return projectSchema;
      case "workExperience":
        return workExperienceSchema;
      case "volunteer":
        return volunteerSchema;
      case "publications":
        return publicationSchema;
      case "organizations":
        return organizationSchema;
      default:
        return z.object({});
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(category.id) as any,
  });

  function getDefaultValues(categoryId: string) {
    switch (categoryId) {
      case "education":
        return {
          level: "",
          institution: "",
          degree: "",
          yearOfPassing: undefined,
          gradeOrScore: "",
          fieldOfStudy: "",
          description: "",
        };
      case "certifications":
        return {
          title: "",
          organization: "",
          year: undefined,
          url: "",
          description: "",
        };
      case "skills":
        return { name: "", level: 3, category: "" };
      case "projects":
        return {
          title: "",
          description: "",
          domain: "",
          toolsOrMethods: "",
          outcome: "",
          url: "",
          githubUrl: "",
          startDate: "",
          endDate: "",
        };
      case "workExperience":
        return {
          organization: "",
          roleOrPosition: "",
          startDate: "",
          endDate: "",
          responsibilities: "",
          skillsOrToolsUsed: "",
          description: "",
        };
      case "publications":
        return {
          title: "",
          type: "",
          journalOrPlatform: "",
          year: undefined,
          url: "",
        };
      case "volunteer":
        return {
          organization: "",
          role: "",
          description: "",
          year: "",
        };
      case "organizations":
        return {
          name: "",
          role: "",
          year: "",
          contribution: "",
        };
      default:
        return {};
    }
  }

  const onSubmit = (data: any) => {
    console.log("🚀 AddEntryForm onSubmit called with data:", data);
    console.log("🚀 Category ID:", category.id);
    onAdd({ ...data, id: Date.now().toString() });
    onCancel();
  };

  const renderFormFields = () => {
    switch (category.id) {
      case "education":
        return (
          <>
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-education-level">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suggestions.education.levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="University/School name"
                      data-testid="input-institution"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree/Program</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Bachelor of Science"
                      data-testid="input-degree"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-field-study">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suggestions.education.fields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearOfPassing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Passing</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 2024"
                      data-testid="input-year-passing"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "certifications":
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., AWS Solutions Architect"
                      data-testid="input-cert-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issuing Organization</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Amazon Web Services"
                      data-testid="input-cert-org"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Obtained</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 2024"
                      data-testid="input-cert-year"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "skills":
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Python Programming"
                      data-testid="input-skill-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-skill-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="soft">Soft Skills</SelectItem>
                      <SelectItem value="tools">Tools & Software</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency Level (1-5)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        {...field}
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        data-testid="input-skill-level"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Level {field.value}:{" "}
                        {
                          [
                            "",
                            "Beginner",
                            "Basic",
                            "Intermediate",
                            "Advanced",
                            "Expert",
                          ][field.value as number]
                        }
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "projects":
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., E-commerce Website"
                      data-testid="input-project-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what you built and the key features..."
                      data-testid="input-project-description"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain/Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-project-domain">
                        <SelectValue placeholder="Select project domain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suggestions.domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toolsOrMethods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies/Tools Used</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., React, Node.js, MongoDB, AWS"
                      data-testid="input-project-tools"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Outcome</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What was the result? Impact? Lessons learned?"
                      data-testid="input-project-outcome"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-project-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-project-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://myproject.com"
                        data-testid="input-project-url"
                      />
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
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://github.com/username/repo"
                        data-testid="input-project-github"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      case "workExperience":
        return (
          <>
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization/Company *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Google, Microsoft, Startup Inc."
                      data-testid="input-work-organization"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleOrPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role/Position *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Software Engineer, Product Manager"
                      data-testid="input-work-role"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-work-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Current if ongoing)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-work-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="• Developed web applications using React and Node.js&#10;• Collaborated with cross-functional teams&#10;• Led code reviews and mentored junior developers"
                      data-testid="input-work-responsibilities"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skillsOrToolsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills & Tools Used</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Python, React, AWS, Docker, Agile"
                      data-testid="input-work-skills"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional context about your role, achievements, or impact..."
                      data-testid="input-work-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "publications":
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Machine Learning in Healthcare Applications"
                      data-testid="input-publication-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-publication-type">
                        <SelectValue placeholder="Select publication type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Research Paper">
                        Research Paper
                      </SelectItem>
                      <SelectItem value="Portfolio Work">
                        Portfolio Work
                      </SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Book">Book</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="journalOrPlatform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal/Platform *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., IEEE Transactions, Medium, Personal Blog"
                      data-testid="input-publication-journal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Year *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 2024"
                      data-testid="input-publication-year"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/my-publication"
                      data-testid="input-publication-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "volunteer":
        return (
          <>
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Red Cross, Local Shelter, Environmental Group"
                      data-testid="input-volunteer-organization"
                    />
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
                  <FormLabel>Role/Position *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Volunteer Coordinator, Event Organizer"
                      data-testid="input-volunteer-role"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year/Duration *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 2023, 2022-2024"
                      data-testid="input-volunteer-year"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description & Impact *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your volunteer work, responsibilities, and the impact you made..."
                      data-testid="input-volunteer-description"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "organizations":
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., IEEE, ACM, Professional Society"
                      data-testid="input-organization-name"
                    />
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
                  <FormLabel>Role/Position *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Member, Secretary, Committee Member"
                      data-testid="input-organization-role"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year/Duration *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 2023, 2022-Present"
                      data-testid="input-organization-year"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution/Activities *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your contributions, activities, or achievements within the organization..."
                      data-testid="input-organization-contribution"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return <div>Form fields for {category.title} coming soon...</div>;
    }
  };

  return (
    <Card className="mt-4 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Add New {category.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            data-testid="button-cancel-entry"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                console.log(
                  "✅ Form validation passed, calling onSubmit with data:",
                  data
                );
                onSubmit(data);
              },
              (errors) => {
                console.error("❌ Form validation errors:", errors);
                console.log("📋 Current form values:", form.getValues());
                console.log("🔍 Form state:", form.formState);
              }
            )}
            className="space-y-4"
          >
            {renderFormFields()}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" data-testid="button-add-entry">
                Add {category.title}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Item display component
function ItemCard({
  item,
  categoryId,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  item: any;
  categoryId: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const renderItemContent = () => {
    switch (categoryId) {
      case "education":
        return (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {item.degree || item.level}{" "}
              {item.fieldOfStudy && `in ${item.fieldOfStudy}`}
            </h4>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {item.institution}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              {item.yearOfPassing && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.yearOfPassing}
                </span>
              )}
              {item.gradeOrScore && (
                <Badge variant="secondary">{item.gradeOrScore}</Badge>
              )}
            </div>
          </div>
        );

      case "certifications":
        return (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {item.title}
            </h4>
            <p className="text-green-600 dark:text-green-400 font-medium">
              {item.organization}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {item.year}
              </span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Certificate
                </a>
              )}
            </div>
          </div>
        );

      case "skills":
        return (
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {item.name}
              </h4>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <Progress value={item.level * 20} className="flex-1" />
                <span className="text-sm text-gray-600">
                  {
                    [
                      "",
                      "Beginner",
                      "Basic",
                      "Intermediate",
                      "Advanced",
                      "Expert",
                    ][item.level]
                  }
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {item.title || item.name || "Untitled"}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {item.description || item.organization || "No description"}
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">{renderItemContent()}</div>
          <div className="flex items-center space-x-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              data-testid="button-toggle-visibility"
            >
              {item.isVisible !== false ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              data-testid="button-edit-item"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              data-testid="button-delete-item"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({
  category,
  onAddEntry,
}: {
  category: AcademicCategory;
  onAddEntry: () => void;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        {category.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No {category.title.toLowerCase()} added yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {category.description}. Start building your profile by adding your first
        entry.
      </p>
      <Button
        onClick={onAddEntry}
        data-testid={`button-add-first-${category.id}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First {category.title}
      </Button>
    </div>
  );
}

// Statistics component
function CategoryStats({ categories }: { categories: AcademicCategory[] }) {
  const totalItems = categories.reduce((sum, cat) => sum + cat.count, 0);
  const completedCategories = categories.filter((cat) => cat.count > 0).length;
  const completionPercentage = Math.round(
    (completedCategories / categories.length) * 100
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Profile Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalItems}
            </div>
            <div className="text-sm text-gray-500">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedCategories}
            </div>
            <div className="text-sm text-gray-500">Categories Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-500">Profile Completion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {categories.length - completedCategories}
            </div>
            <div className="text-sm text-gray-500">Remaining Sections</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [categories, setCategories] = useState<AcademicCategory[]>(
    getInitialCategories()
  );
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingContact, setEditingContact] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id || "user_sample_1";

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
  });

  // Load education data
  const { data: educationData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/education", userId],
    enabled: !!userId,
  });

  // Load other category data
  const { data: certificationsData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/certifications", userId],
    enabled: !!userId,
  });

  const { data: skillsData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/skills", userId],
    enabled: !!userId,
  });

  const { data: projectsData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/projects", userId],
    enabled: !!userId,
  });

  const { data: workExperienceData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/work-experience", userId],
    enabled: !!userId,
  });

  const { data: publicationsData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/publications", userId],
    enabled: !!userId,
  });

  const { data: organizationsData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/organizations", userId],
    enabled: !!userId,
  });

  const { data: volunteerData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/volunteer-experience", userId],
    enabled: !!userId,
  });

  // Update categories when data loads - using useMemo to prevent infinite re-renders
  const categoriesWithData = React.useMemo(() => {
    return categories.map((cat) => {
      switch (cat.id) {
        case "education":
          return { ...cat, items: educationData, count: educationData.length };
        case "certifications":
          return {
            ...cat,
            items: certificationsData,
            count: certificationsData.length,
          };
        case "skills":
          return { ...cat, items: skillsData, count: skillsData.length };
        case "projects":
          return { ...cat, items: projectsData, count: projectsData.length };
        case "workExperience":
          return {
            ...cat,
            items: workExperienceData,
            count: workExperienceData.length,
          };
        case "publications":
          return {
            ...cat,
            items: publicationsData,
            count: publicationsData.length,
          };
        case "organizations":
          return {
            ...cat,
            items: organizationsData,
            count: organizationsData.length,
          };
        case "volunteer":
          return { ...cat, items: volunteerData, count: volunteerData.length };
        default:
          return cat;
      }
    });
  }, [
    categories,
    educationData,
    certificationsData,
    skillsData,
    projectsData,
    workExperienceData,
    publicationsData,
    organizationsData,
    volunteerData,
  ]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    );
  };

  // Quick action handlers
  const handleAddCertification = () => {
    console.log("🚀 QuickActions: Opening certification form");
    setActiveForm("certifications");
  };

  const handleAddProject = () => {
    console.log("🚀 QuickActions: Opening project form");
    setActiveForm("projects");
  };

  const handleAddExperience = () => {
    console.log("🚀 QuickActions: Opening work experience form");
    setActiveForm("workExperience");
  };

  // Add new entry
  const addEntry = async (categoryId: string, data: any) => {
    try {
      console.log("📝 Starting addEntry for:", categoryId, "with data:", data);
      setIsSubmitting(true);

      // Prepare data for API
      const apiData = {
        userId: userId.toString(),
        ...data,
      };
      console.log("📡 API call data:", apiData);

      // Map categoryId to API endpoint
      const apiEndpointMap: { [key: string]: string } = {
        workExperience: "work-experience",
        volunteer: "volunteer",
        publications: "publications",
        organizations: "organizations",
      };
      const apiEndpoint = apiEndpointMap[categoryId] || categoryId;

      // Call the appropriate API endpoint
      console.log(`🌐 Making API call to: /api/${apiEndpoint}`);
      const response = await fetch(`/api/${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      console.log("📥 API response:", response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API error response:", errorText);
        throw new Error(`Failed to add ${categoryId} entry: ${errorText}`);
      }

      const savedItem = await response.json();
      console.log("✅ Item saved successfully:", savedItem);

      // Invalidate the relevant query to refresh data
      console.log("🔄 Invalidating queries for:", [
        `/api/${apiEndpoint}`,
        userId,
      ]);
      await queryClient.invalidateQueries({
        queryKey: [`/api/${apiEndpoint}`, userId],
      });

      setActiveForm(null);
      console.log("✨ Form closed and success toast shown");
      toast({
        title: "Entry Added",
        description: `New ${categoryId} entry has been saved successfully.`,
      });
    } catch (error) {
      console.error(`❌ Error adding ${categoryId}:`, error);
      toast({
        title: "Error",
        description: `Failed to add ${categoryId} entry. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete entry
  const deleteEntry = async (categoryId: string, itemId: string) => {
    try {
      setIsSubmitting(true);

      // Map categoryId to API endpoint
      const apiEndpointMap: { [key: string]: string } = {
        workExperience: "work-experience",
        volunteer: "volunteer",
        publications: "publications",
        organizations: "organizations",
      };
      const apiEndpoint = apiEndpointMap[categoryId] || categoryId;

      const response = await fetch(`/api/${apiEndpoint}/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${categoryId} entry`);
      }

      // Invalidate the relevant query to refresh data
      await queryClient.invalidateQueries({
        queryKey: [`/api/${apiEndpoint}`, userId],
      });

      toast({
        title: "Entry Deleted",
        description: "Entry has been removed successfully.",
      });
    } catch (error) {
      console.error(`Error deleting ${categoryId}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${categoryId} entry. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle item visibility
  const toggleItemVisibility = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item) =>
              item.id === itemId
                ? { ...item, isVisible: !item.isVisible }
                : item
            ),
          };
        }
        return cat;
      })
    );
  };

  const saveProfile = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Profile Saved",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 
      `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-open-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your profile information and academic details
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                onClick={saveProfile}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-profile"
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Profile Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile information, education, skills, and
                experience
              </p>
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" data-testid="tab-basic-info">
                Basic Information
              </TabsTrigger>
              <TabsTrigger value="academic" data-testid="tab-academic-details">
                Academic Details
              </TabsTrigger>
              <TabsTrigger value="view" data-testid="tab-view-profile">
                Preview Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Personal Details Card */}
              {!editingPersonal ? (
                <Card className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Personal Details</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPersonal(true)}
                        data-testid="button-edit-personal-basic"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage
                            src={profile?.personalDetails?.photo || ""}
                            alt={profile?.personalDetails?.fullName || ""}
                          />
                          <AvatarFallback className="text-xl">
                            {profile?.personalDetails?.fullName
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") ||
                              user?.firstName?.[0] ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {profile?.personalDetails?.fullName ||
                              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role/Title</label>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {profile?.personalDetails?.roleOrTitle || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {profile?.personalDetails?.dob || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {profile?.personalDetails?.gender || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</label>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {profile?.personalDetails?.nationality || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {profile?.personalDetails?.location ? (
                              profile.personalDetails.location.city &&
                              profile.personalDetails.location.state
                                ? `${profile.personalDetails.location.city}, ${profile.personalDetails.location.state}, ${profile.personalDetails.location.country}`
                                : profile.personalDetails.location.city ||
                                  profile.personalDetails.location.state ||
                                  profile.personalDetails.location.country
                            ) : (
                              "Not provided"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {profile?.personalDetails?.summary ? (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Professional Summary</label>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {profile.personalDetails.summary}
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Add a professional summary to highlight your experience and goals.
                        </p>
                      </div>
                    )}

                    {profile?.personalDetails?.languagesKnown && profile.personalDetails.languagesKnown.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages Known</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.personalDetails.languagesKnown.map((lang, index) => (
                            <Badge key={index} variant="secondary">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <PersonalDetailsEditForm 
                  profile={profile} 
                  user={user}
                  onCancel={() => setEditingPersonal(false)}
                  onSave={() => {
                    setEditingPersonal(false);
                    queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
                  }}
                />
              )}

              {/* Contact Details Card */}
              {!editingContact ? (
                <Card className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Mail className="h-5 w-5" />
                        <span>Contact Details</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContact(true)}
                        data-testid="button-edit-contact-basic"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.contactDetails?.email || user?.email || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.contactDetails?.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.contactDetails?.website ? (
                            <a href={profile.contactDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              {profile.contactDetails.website}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.contactDetails?.linkedin ? (
                            <a href={profile.contactDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              {profile.contactDetails.linkedin}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">GitHub/Portfolio</label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.contactDetails?.githubOrPortfolio ? (
                            <a href={profile.contactDetails.githubOrPortfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              {profile.contactDetails.githubOrPortfolio}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Twitter</label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.contactDetails?.twitter ? (
                            <a href={profile.contactDetails.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              {profile.contactDetails.twitter}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ContactDetailsEditForm 
                  profile={profile} 
                  user={user}
                  onCancel={() => setEditingContact(false)}
                  onSave={() => {
                    setEditingContact(false);
                    queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              {/* Statistics */}
              <CategoryStats categories={categoriesWithData} />

              {/* Categories */}
              <div className="space-y-4">
                {categoriesWithData.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {category.icon}
                          <div>
                            <CardTitle className="text-lg">
                              {category.title}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            data-testid={`badge-count-${category.id}`}
                          >
                            {category.count}{" "}
                            {category.count === 1 ? "item" : "items"}
                          </Badge>
                          {category.isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {category.isExpanded && (
                      <CardContent className="pt-0">
                        {category.count === 0 && activeForm !== category.id ? (
                          <EmptyState
                            category={category}
                            onAddEntry={() => setActiveForm(category.id)}
                          />
                        ) : category.count > 0 ? (
                          <div className="space-y-3">
                            {category.items.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                categoryId={category.id}
                                onEdit={() => {
                                  /* TODO: Implement edit */
                                }}
                                onDelete={() =>
                                  deleteEntry(category.id, item.id)
                                }
                                onToggleVisibility={() =>
                                  toggleItemVisibility(category.id, item.id)
                                }
                              />
                            ))}
                            <div className="flex justify-center pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  console.log(
                                    "🎯 Add Entry button clicked for category:",
                                    category.id
                                  );
                                  console.log(
                                    "🎯 Current activeForm state:",
                                    activeForm
                                  );
                                  setActiveForm(category.id);
                                  console.log(
                                    "🎯 Setting activeForm to:",
                                    category.id
                                  );
                                }}
                                data-testid={`button-add-${category.id}`}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another {category.title}
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {/* Add Entry Form */}
                        {activeForm === category.id && (
                          <>
                            {console.log(
                              "🎨 Rendering form for category:",
                              category.id,
                              "activeForm:",
                              activeForm
                            )}
                            <AddEntryForm
                              category={category}
                              onAdd={(data) => {
                                console.log(
                                  "📋 Form submitted with data:",
                                  data
                                );
                                addEntry(category.id, data);
                              }}
                              onCancel={() => {
                                console.log("❌ Form cancelled");
                                setActiveForm(null);
                              }}
                            />
                          </>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="view" className="space-y-6">
              {/* Personal Details Card */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Details</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("basic")}
                      data-testid="button-edit-personal"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={profile?.personalDetails?.photo || ""}
                          alt={profile?.personalDetails?.fullName || ""}
                        />
                        <AvatarFallback className="text-xl">
                          {profile?.personalDetails?.fullName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") ||
                            user?.firstName?.[0] ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Full Name
                        </label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.personalDetails?.fullName ||
                            `${user?.firstName || ""} ${
                              user?.lastName || ""
                            }`.trim() ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Role/Title
                        </label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.personalDetails?.roleOrTitle ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date of Birth
                        </label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.personalDetails?.dob || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Gender
                        </label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.personalDetails?.gender || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Nationality
                        </label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.personalDetails?.nationality ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Location
                        </label>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {profile?.personalDetails?.location
                            ? profile.personalDetails.location.city &&
                              profile.personalDetails.location.state
                              ? `${profile.personalDetails.location.city}, ${profile.personalDetails.location.state}, ${profile.personalDetails.location.country}`
                              : profile.personalDetails.location.city ||
                                profile.personalDetails.location.state ||
                                profile.personalDetails.location.country
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {profile?.personalDetails?.summary ? (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Professional Summary
                      </label>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {profile.personalDetails.summary}
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Add a professional summary to highlight your experience
                        and goals.
                      </p>
                    </div>
                  )}

                  {profile?.personalDetails?.languagesKnown &&
                    profile.personalDetails.languagesKnown.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Languages Known
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.personalDetails.languagesKnown.map(
                            (lang, index) => (
                              <Badge key={index} variant="secondary">
                                {lang}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Contact Details Card */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Contact Details</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("basic")}
                      data-testid="button-edit-contact"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email Address
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile?.contactDetails?.email ||
                          user?.email ||
                          "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone Number
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile?.contactDetails?.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Website
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile?.contactDetails?.website ? (
                          <a
                            href={profile.contactDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {profile.contactDetails.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        LinkedIn
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile?.contactDetails?.linkedin ? (
                          <a
                            href={profile.contactDetails.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {profile.contactDetails.linkedin}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        GitHub/Portfolio
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile?.contactDetails?.githubOrPortfolio ? (
                          <a
                            href={profile.contactDetails.githubOrPortfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {profile.contactDetails.githubOrPortfolio}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Twitter
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile?.contactDetails?.twitter ? (
                          <a
                            href={profile.contactDetails.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {profile.contactDetails.twitter}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Portfolio Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories
                      .filter((cat) => cat.count > 0)
                      .map((category) => (
                        <Card key={category.id}>
                          <CardContent className="p-4 text-center">
                            <div className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400">
                              {category.icon}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {category.count}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.title}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
