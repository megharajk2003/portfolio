import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  year: z.number().min(1900, "Valid year required"),
  url: z.string().url().optional(),
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
  toolsOrMethods: z.array(z.string()),
  outcome: z.string().optional(),
  url: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const workExperienceSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  roleOrPosition: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  responsibilities: z.array(z.string()),
  skillsOrToolsUsed: z.array(z.string()),
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
      default:
        return {};
    }
  }

  const onSubmit = (data: any) => {
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

  const { user } = useAuth();
  const { toast } = useToast();
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

  // Update categories when data loads
  React.useEffect(() => {
    setCategories((prev) =>
      prev.map((cat) => {
        switch (cat.id) {
          case "education":
            return { ...cat, items: educationData, count: educationData.length };
          case "certifications":
            return { ...cat, items: certificationsData, count: certificationsData.length };
          case "skills":
            return { ...cat, items: skillsData, count: skillsData.length };
          case "projects":
            return { ...cat, items: projectsData, count: projectsData.length };
          case "work-experience":
            return { ...cat, items: workExperienceData, count: workExperienceData.length };
          case "publications":
            return { ...cat, items: publicationsData, count: publicationsData.length };
          case "organizations":
            return { ...cat, items: organizationsData, count: organizationsData.length };
          case "volunteer":
            return { ...cat, items: volunteerData, count: volunteerData.length };
          default:
            return cat;
        }
      })
    );
  }, [educationData, certificationsData, skillsData, projectsData, workExperienceData, publicationsData, organizationsData, volunteerData]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    );
  };

  // Add new entry
  const addEntry = async (categoryId: string, data: any) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const apiData = {
        userId: userId,
        ...data
      };

      // Call the appropriate API endpoint
      const response = await fetch(`/api/${categoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add ${categoryId} entry`);
      }

      const savedItem = await response.json();

      // Update local state with saved item
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              items: [...cat.items, savedItem],
              count: cat.count + 1,
            };
          }
          return cat;
        })
      );
      
      setActiveForm(null);
      toast({
        title: "Entry Added",
        description: `New ${categoryId} entry has been saved successfully.`,
      });
    } catch (error) {
      console.error(`Error adding ${categoryId}:`, error);
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
      
      const response = await fetch(`/api/${categoryId}/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${categoryId} entry`);
      }

      // Update local state
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              items: cat.items.filter((item) => item.id !== itemId),
              count: cat.count - 1,
            };
          }
          return cat;
        })
      );
      
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
              <SimpleComprehensiveForm
                onSuccess={() => setActiveTab("academic")}
              />
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              {/* Statistics */}
              <CategoryStats categories={categories} />

              {/* Categories */}
              <div className="space-y-4">
                {categories.map((category) => (
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
                        {category.count === 0 ? (
                          <EmptyState
                            category={category}
                            onAddEntry={() => setActiveForm(category.id)}
                          />
                        ) : (
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
                                onClick={() => setActiveForm(category.id)}
                                data-testid={`button-add-${category.id}`}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another {category.title}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Add Entry Form */}
                        {activeForm === category.id && (
                          <AddEntryForm
                            category={category}
                            onAdd={(data) => addEntry(category.id, data)}
                            onCancel={() => setActiveForm(null)}
                          />
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="view" className="space-y-6">
              {/* Profile Preview Card */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Preview</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("basic")}
                      data-testid="button-edit-profile"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={profile?.personalDetails?.photo || ""}
                          alt={profile?.personalDetails?.fullName || ""}
                        />
                        <AvatarFallback className="text-2xl">
                          {profile?.personalDetails?.fullName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") ||
                            user?.firstName?.[0] ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profile?.personalDetails?.fullName ||
                          `${user?.firstName || ""} ${
                            user?.lastName || ""
                          }`.trim() ||
                          "Add your name"}
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                        {profile?.personalDetails?.roleOrTitle ||
                          "Add your professional role"}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>
                            {profile?.contactDetails?.email ||
                              user?.email ||
                              "Add your email"}
                          </span>
                        </div>
                        {profile?.contactDetails?.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{profile.contactDetails.phone}</span>
                          </div>
                        )}
                        {profile?.personalDetails?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {profile.personalDetails.location.city &&
                              profile.personalDetails.location.state
                                ? `${profile.personalDetails.location.city}, ${profile.personalDetails.location.state}`
                                : profile.personalDetails.location.city ||
                                  profile.personalDetails.location.state ||
                                  profile.personalDetails.location.country ||
                                  "Add your location"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile?.personalDetails?.summary ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Professional Summary
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {profile.personalDetails.summary}
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Add a professional summary to highlight your experience
                        and goals.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setActiveTab("basic")}
                        data-testid="button-add-summary"
                      >
                        Add Summary
                      </Button>
                    </div>
                  )}

                  {/* Academic Summary */}
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
