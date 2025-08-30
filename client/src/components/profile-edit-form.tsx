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
// FIX: Import the 'profiles' table object to infer its type
import { insertProfileSchema, profiles } from "@shared/schema";
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
  Camera,
  Upload,
} from "lucide-react";
import { ArrayField } from "./array-field";

// FIX: Infer the Profile type directly from the Drizzle schema for better type safety
type Profile = typeof profiles.$inferSelect;

const profileFormSchema = insertProfileSchema.omit({ userId: true }).extend({
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
  // Social Links - optional
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
  leetcodeUrl: z
    .string()
    .url("Invalid LeetCode URL")
    .optional()
    .or(z.literal("")),
  // Array fields - optional
  otherLinks: z.array(z.string().url()).optional(),
  languages: z.array(z.string().min(1)).optional(),
  achievements: z.array(z.string().min(5)).optional(),
  certificates: z.array(z.string().min(5)).optional(),
  organizations: z.array(z.string().min(2)).optional(),
  // Text fields - optional
  educationSummary: z.string().max(500).optional(),
  skillsSummary: z.string().max(500).optional(),
  internshipExperience: z.string().max(500).optional(),
  // Photo field
  photo: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  onSuccess?: () => void;
  showCompactMode?: boolean;
}

export default function ProfileEditForm({
  onSuccess,
  showCompactMode = false,
}: ProfileEditFormProps) {
  console.log(" Mouting ProfileEditForm...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;
  console.log(" User from useAuth:", user);
  console.log(" Initial userId:", userId);

  // FIX: Use the inferred Profile type for the useQuery hook
  const { data: existingProfile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });
  console.log(" Existing profile from useQuery:", existingProfile);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
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
      leetcodeUrl: "",
      otherLinks: [],
      languages: [],
      achievements: [],
      certificates: [],
      organizations: [],
      educationSummary: "",
      skillsSummary: "",
      internshipExperience: "",
      photo: "", // Initialize photo field
    },
  });

  useEffect(() => {
    console.log(
      " useEffect triggered. User:",
      user,
      "ExistingProfile:",
      existingProfile
    );
    if (user || existingProfile) {
      const profile = existingProfile; // No need for type assertion now
      const formData: Partial<ProfileFormData> = {
        name:
          profile?.name ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        role: profile?.role || "",
        email: profile?.email || user?.email || "",
        phone: profile?.phone || "",
        location: profile?.location || "",
        summary: profile?.summary || "",
        githubUrl: profile?.githubUrl || "",
        linkedinUrl: profile?.linkedinUrl || "",
        portfolioUrl: profile?.portfolioUrl || "",
        leetcodeUrl: profile?.leetcodeUrl || "",
        otherLinks: profile?.otherLinks || [],
        languages: profile?.languages || [],
        achievements: profile?.achievements || [],
        certificates: profile?.certificates || [],
        organizations: profile?.organizations || [],
        educationSummary: profile?.educationSummary || "",
        skillsSummary: profile?.skillsSummary || "",
        internshipExperience: profile?.internshipExperience || "",
        photo: profile?.photoUrl || "", // Assuming photoUrl is the field for existing photo
      };

      if (!form.formState.isDirty) {
        console.log(" Populating form with data:", formData);
        form.reset(formData);
      } else {
        console.log(" Form is dirty, skipping reset.");
      }
    }
  }, [user, existingProfile, form]);

  const createProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      // FIX: Ensure userId is a number to match the database schema.
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        // This case should be handled by the !userId check, but it's a good safeguard.
        throw new Error("User ID is invalid.");
      }
      const payload = { ...data, userId: numericUserId };
      console.log(" createProfileMutation payload:", payload);
      return apiRequest("POST", "/api/profile", payload);
    },
    onSuccess: (result) => {
      console.log(" createProfileMutation success:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error(" createProfileMutation error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    // FIX: The data passed here should only be the form fields, not the userId.
    mutationFn: (data: Partial<ProfileFormData>) => {
      console.log(" updateProfileMutation payload:", data);
      return apiRequest("PATCH", `/api/profile/${userId}`, data);
    },
    onSuccess: (result) => {
      console.log(" updateProfileMutation success:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error(" updateProfileMutation error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    console.log(" onSubmit called with data:", data);
    if (!userId) {
      console.log(" User ID is missing, aborting submit.");
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    console.log(" Starting submission...");

    setIsSubmitting(true);

    try {
      if (existingProfile) {
        console.log(" Updating profile for userId:", userId);
        // FIX: Pass only the form data. The userId is already in the API endpoint URL.
        const result = await updateProfileMutation.mutateAsync(data);
        console.log(" Update profile success:", result);
      } else {
        console.log(" Creating profile for userId:", userId);
        // The create mutation will handle adding the numeric userId.
        const result = await createProfileMutation.mutateAsync(data);
        console.log(" Create profile success:", result);
      }
    } catch (err) {
      console.error(" Profile API error:", err);
    } finally {
      setIsSubmitting(false);
      console.log(" Finished profile submit process.");
    }
  };

  if (isLoading) {
    console.log(" isLoading is true, rendering loading state.");
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
    <Card className={showCompactMode ? "" : "max-w-2xl mx-auto"}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>
            {existingProfile ? "Edit Profile" : "Complete Your Profile"}
          </span>
        </CardTitle>
        {!existingProfile && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete your profile to unlock all features and improve your
            visibility.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                console.log(" Form passed validation:", data);
                onSubmit(data);
              },
              (errors) => {
                console.error(" Validation errors:", errors);
              }
            )}
            className="space-y-6"
          >
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
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload Section */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span>Profile Photo</span>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Current Photo Display */}
                          {field.value && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={field.value}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange("")}
                              >
                                Remove Photo
                              </Button>
                            </div>
                          )}

                          {/* Photo Upload Input */}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Convert to base64 for storage
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64String = event.target?.result as string;
                                    field.onChange(base64String);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label
                              htmlFor="photo-upload"
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload Photo</span>
                            </label>
                            <span className="text-sm text-gray-500">
                              JPG, PNG, GIF up to 5MB
                            </span>
                          </div>

                          {/* Photo URL Input as Alternative */}
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Or enter photo URL:</p>
                            <Input
                              placeholder="https://example.com/photo.jpg"
                              value={field.value?.startsWith('http') ? field.value : ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        data-testid="input-role"
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
                        data-testid="input-email"
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
                        data-testid="input-phone"
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
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, State, Country"
                        {...field}
                        data-testid="input-location"
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
                        data-testid="textarea-summary"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      {field.value?.length || 0} / 500 characters (minimum 50)
                    </p>
                  </FormItem>
                )}
              />

              {/* Social Links Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Social Links</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Linkedin className="h-4 w-4" />
                            <span>LinkedIn URL</span>
                          </FormLabel>
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
                      control={form.control}
                      name="portfolioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>Portfolio URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourportfolio.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leetcodeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Award className="h-4 w-4" />
                            <span>LeetCode URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://leetcode.com/username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Education Summary */}
              <FormField
                control={form.control}
                name="educationSummary"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Education Summary</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., B.E - Electronics and Communication Engineering, Easwari engineering college (2020-2024), HSC from Chanakya matric hr sec school..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Brief summary of your educational background
                    </p>
                  </FormItem>
                )}
              />

              {/* Skills Summary */}
              <FormField
                control={form.control}
                name="skillsSummary"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Skills Summary</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Python, C++, JAVA, HTML, CSS, React, SQL, Machine Learning..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      List your key technical and professional skills
                    </p>
                  </FormItem>
                )}
              />

              {/* Languages */}
              <ArrayField
                control={form.control}
                name="languages"
                label="Languages"
                placeholder="e.g., Tamil, English, Hindi"
                icon={<Users className="h-4 w-4" />}
                description="Languages you can speak, read, or write"
              />

              {/* Achievements */}
              <ArrayField
                control={form.control}
                name="achievements"
                label="Achievements"
                placeholder="e.g., Got 1st prize in D-SIM conducted at INVENTE'22, Shiv nadar university"
                icon={<Award className="h-4 w-4" />}
                description="Awards, competitions, recognitions, and notable accomplishments"
              />

              {/* Certificates */}
              <ArrayField
                control={form.control}
                name="certificates"
                label="Certificates"
                placeholder="e.g., Problem solving python, INTRODUCTION TO INDUSTRIAL 4.o AND INDUSTRIAL INTERNET OF THINGS, NPTEL"
                icon={<BookOpen className="h-4 w-4" />}
                description="Professional certifications and course completions"
              />

              {/* Internship Experience */}
              <FormField
                control={form.control}
                name="internshipExperience"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Internship Experience</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., EMBEDDED SYSTEM WITH IOT, NSIC - Gained hands-on experience in IoT development and embedded systems..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe your internship experiences and what you learned
                    </p>
                  </FormItem>
                )}
              />

              {/* Organizations */}
              <ArrayField
                control={form.control}
                name="organizations"
                label="Organizations"
                placeholder="e.g., Street cause - NGO (volunteer), Rotaract (member)"
                icon={<Users className="h-4 w-4" />}
                description="Professional organizations, clubs, volunteer work"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-save-profile"
              >
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
  );
}