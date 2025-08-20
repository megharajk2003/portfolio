import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import SimpleComprehensiveForm from "@/components/comprehensive-profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@shared/schema";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const { user } = useAuth();
  const userId = user?.id || "user_sample_1"; // Fallback for demo

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
  });

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
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your profile information
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Profile Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile information and portfolio settings
              </p>
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" data-testid="tab-edit-profile">
                Edit Profile
              </TabsTrigger>
              <TabsTrigger value="view" data-testid="tab-view-profile" disabled>
                View Profile (Coming Soon)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              <SimpleComprehensiveForm onSuccess={() => setActiveTab("view")} />
            </TabsContent>

            <TabsContent value="view" className="space-y-6">
              {/* Profile Header Card */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("edit")}
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
                              user?.email?.[0] ||
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
                        onClick={() => setActiveTab("edit")}
                        data-testid="button-add-summary"
                      >
                        Add Summary
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
