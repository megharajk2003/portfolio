import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
// FIX: Import the 'profiles' table object itself, not its type.
import { profiles } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/ui/footer";
import StatsGrid from "@/components/stats-grid";
import LearningModules from "@/components/learning-modules";
import CompletedCourses from "@/components/completed-courses";
import SkillRadarChart from "@/components/skill-radar-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Player } from "@lottiefiles/react-lottie-player";

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
  CircleCheckBig,
  Menu,
} from "lucide-react";
import ProfileCompletionNotification from "@/components/profile-completion-notification";
import ActivityCalendar from "@/components/activity-calendar";
import ProjectsAchievements from "@/components/projects-achievements";
import QuickActions from "@/components/quick-actions";
import GoalHeatMap from "@/components/goal-heat-map";
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

  // Pre-fetch courses data for learning modules
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Check if user has already checked in today
  const today = new Date().toISOString().split('T')[0];
  const { data: todayActivity } = useQuery({
    queryKey: ["/api/daily-activity", userId, today],
    queryFn: async () => {
      const response = await fetch(`/api/daily-activity/${userId}?startDate=${today}&endDate=${today}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const hasCheckedInToday = todayActivity && todayActivity.length > 0;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Daily check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const response = await fetch('/api/daily-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          date: today,
          xpEarned: 10, // Daily check-in XP reward
          lessonsCompleted: 0
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check in');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Daily Check-in Complete! 🎉",
        description: "You earned 10 XP for checking in today. Keep your streak going!",
      });
      
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-activity", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-activity", userId, today] });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in Failed",
        description: error.message.includes('already checked in') 
          ? "You've already checked in today! Come back tomorrow to continue your streak."
          : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate();
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
                onClick={handleCheckIn}
                disabled={checkInMutation.isPending || hasCheckedInToday}
                className={`hidden sm:flex text-white disabled:opacity-50 ${
                  hasCheckedInToday 
                    ? "bg-green-500 hover:bg-green-500 cursor-not-allowed" 
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
                size="sm"
              >
                <CircleCheckBig className="mr-2 h-4 w-4" />
                {checkInMutation.isPending 
                  ? "Checking in..." 
                  : hasCheckedInToday 
                    ? "Checked In" 
                    : "Daily Check In"
                }
              </Button>

              {/* Mobile check-in button */}
              <Button
                onClick={handleCheckIn}
                disabled={checkInMutation.isPending || hasCheckedInToday}
                variant="ghost"
                size="icon"
                className={`sm:hidden ${
                  hasCheckedInToday ? "text-green-500" : ""
                }`}
                title={hasCheckedInToday ? "Checked In" : "Daily Check In"}
              >
                <CircleCheckBig className="h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Learning Heat Map */}
            <GoalHeatMap />
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 justify-between flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700 flex items-center justify-between ">
                <div className="flex items-center space-x-4">
                  <div className="px-5 relative ">
                    <img
                      className="w-32 h-32 rounded-full object-contain bg-gray-100 dark:bg-gray-800"
                      src={
                        profile?.personalDetails?.photo ||
                        "https://img.freepik.com/premium-photo/avatar-icon_665280-58322.jpg"
                      }
                      alt={
                        profile?.personalDetails?.fullName || "Profile picture"
                      }
                    />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
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
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {profile?.contactDetails?.phone || "Phone"}
                    </p>
                  </div>
                  <Player
                    autoplay
                    loop
                    src="https://lottie.host/808a860f-b6c9-4e5a-a7e2-659f5a45127c/ebhZk5XZe6.json"
                    style={{ height: "150px", width: "150px" }} // Adjusted size slightly for this animation
                  />
                </div>
              </div>
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
            </section>
          </div>
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

          {/* Learning Modules and Completed Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LearningModules userId={userId} />
            <CompletedCourses userId={userId} />
          </div>

          {/* Milestone Badges */}
          <section>
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    🏆 Achievement Badges
                  </CardTitle>
                  <Badge variant="secondary" className="px-3 py-1">
                    4 Earned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl border-2 border-purple-300 shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-500 border-2 border-purple-400 flex items-center justify-center shadow-sm">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-purple-800 mb-1">
                        AI Pioneer
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Completed AI course
                      </p>
                      <div className="flex items-center justify-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +100 XP
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-xl border-2 border-yellow-300 shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-yellow-500 border-2 border-yellow-400 flex items-center justify-center shadow-sm">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                        Perfect Score
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">100% on exam</p>
                      <div className="flex items-center justify-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +100 XP
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-xl border-2 border-emerald-300 shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 border-2 border-emerald-400 flex items-center justify-center shadow-sm">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                        Streak Master
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">7-day streak</p>
                      <div className="flex items-center justify-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +50 XP
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl border-2 border-blue-300 shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-blue-500 border-2 border-blue-400 flex items-center justify-center shadow-sm">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-blue-800 mb-1">
                        Knowledge Seeker
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Completed 5 courses
                      </p>
                      <div className="flex items-center justify-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +200 XP
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Complete more courses and activities to unlock more badges!
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

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
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
