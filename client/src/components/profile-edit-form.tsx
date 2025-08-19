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
import { insertProfileSchema } from "@shared/schema";
import { Save, User, Mail, Phone, MapPin, FileText } from "lucide-react";

const profileFormSchema = insertProfileSchema.extend({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;

  const { data: existingProfile, isLoading } = useQuery({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  // Define profile type for type safety
  type ProfileType = {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    photoUrl?: string | null;
    portfolioTheme?: string;
    isPublic?: boolean;
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
  });

  // Update form when user data or existing profile loads
  useEffect(() => {
    if (user || existingProfile) {
      const profile = existingProfile as ProfileType;
      const formData: Partial<ProfileFormData> = {
        name:
          profile?.name ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        role: profile?.role || "",
        email: profile?.email || user?.emailAddresses?.[0]?.emailAddress || "",
        phone: profile?.phone || "",
        location: profile?.location || "",
        summary: profile?.summary || "",
      };

      // Only update if the form hasn't been touched
      if (!form.formState.isDirty) {
        form.reset(formData);
      }
    }
  }, [user, existingProfile, form]);

  const createProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("/api/profile", "POST", { ...data, userId }),
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
    mutationFn: (data: Partial<ProfileFormData>) =>
      apiRequest(`/api/profile/${userId}`, "PATCH", data),
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

  const onSubmit = async (data: ProfileFormData) => {
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
                        disabled={!!user?.emailAddresses?.[0]?.emailAddress}
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
