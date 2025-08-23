import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// FIX: Import the 'profiles' table object itself, not its type.
import { profiles } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/ui/footer";
import StatsGrid from "@/components/stats-grid";
import LearningModules from "@/components/learning-modules";
import SkillRadarChart from "@/components/skill-radar-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import {
  LogOut,
  User,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Zap,
  Edit,
  FileText,
  Link,
  Menu,
} from "lucide-react";
import ProfileCompletionNotification from "@/components/profile-completion-notification";
import ActivityCalendar from "@/components/activity-calendar";
import ProjectsAchievements from "@/components/projects-achievements";
import QuickActions from "@/components/quick-actions";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

// FIX: Infer the type for a single profile row from the Drizzle schema.
type Profile = typeof profiles.$inferSelect;

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userId = user?.id?.toString() ?? "1"; // Fallback for demo
  console.log("Dashboard - userId:", userId);
  // FIX: Use the correctly inferred 'Profile' type for the query data.
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user-stats", userId],
  });

  const handleExportPDF = () => {
    // PDF export functionality will be implemented
    console.log("Exporting PDF...");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
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
                <h2 className="text-2xl sm:text-3xl font-bold">
                  <span className="text-gradient">Welcome back,</span>{" "}
                  <span className="text-primary">
                    {user?.firstName ||
                      profile?.personalDetails?.fullName?.split(" ")[0] ||
                      "Professional"}
                  </span>
                  !
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your portfolio and continue learning
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* PDF Export Button - Hidden on mobile */}
              <Button
                onClick={handleExportPDF}
                className="hidden sm:flex bg-red-600 text-white hover:bg-red-700"
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>

              {/* Mobile PDF button */}
              <Button
                onClick={handleExportPDF}
                variant="ghost"
                size="icon"
                className="sm:hidden"
              >
                <FileText className="h-5 w-5" />
              </Button>

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
          {/* Profile Completion Notification */}
          <ProfileCompletionNotification />

          {/* Hero Section */}
          <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={profile?.personalDetails?.photo || ""}
                      alt={profile?.personalDetails?.fullName || ""}
                    />
                    <AvatarFallback className="text-xl">
                      {profile?.personalDetails?.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.personalDetails?.fullName ||
                      `${user?.firstName || ""} ${
                        user?.lastName || ""
                      }`.trim() ||
                      "User Name"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {profile?.personalDetails?.roleOrTitle ||
                      "Professional Role"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile?.contactDetails?.email ||
                      user?.email ||
                      "email@example.com"}
                  </p>
                </div>
              </div>
              <Link href="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            </div>
          </section>

          {/* Stats Cards */}
          <StatsGrid userId={userId} />

          {/* Quick Actions - Mobile First */}
          <div className="lg:hidden">
            <QuickActions
              onAddCertification={() =>
                console.log("Dashboard: Navigate to certification form")
              }
              onAddProject={() =>
                console.log("Dashboard: Navigate to project form")
              }
              onAddExperience={() =>
                console.log("Dashboard: Navigate to experience form")
              }
            />
          </div>

          {/* Learning Activity - Now before Learning Modules */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Learning Activity
            </h3>
            <ActivityCalendar userId={userId} />
          </section>

          {/* Learning Modules */}
          <LearningModules userId={userId} />

          {/* Skill Dashboard */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Skill Dashboard
            </h3>
            <SkillRadarChart userId={userId} />
          </section>

          {/* Projects & Achievements */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Projects & Achievements
            </h3>
            <ProjectsAchievements userId={userId} />
          </section>

          {/* Right sidebar content for desktop */}
          <div className="hidden lg:block">
            <QuickActions
              onAddCertification={() =>
                console.log("Dashboard: Navigate to certification form")
              }
              onAddProject={() =>
                console.log("Dashboard: Navigate to project form")
              }
              onAddExperience={() =>
                console.log("Dashboard: Navigate to experience form")
              }
            />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
