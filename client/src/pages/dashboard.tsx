import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
// FIX: Import the 'profiles' table object itself, not its type.
import { profiles } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/ui/footer";
import StatsGrid from "@/components/stats-grid";
import RecentBadges from "@/components/recent-badges";
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
  History,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Trash2,
} from "lucide-react";
import ProfileCompletionNotification from "@/components/profile-completion-notification";
import ActivityCalendar from "@/components/activity-calendar";
import ProjectsAchievements from "@/components/projects-achievements";
import QuickActions from "@/components/quick-actions";
import RealGoalHeatMap from "@/components/real-goal-heat-map";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // ✅ correct

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// FIX: Infer the type for a single profile row from the Drizzle schema.
type Profile = typeof profiles.$inferSelect;

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCheckInHistory, setShowCheckInHistory] = useState(false);

  const userId = user?.id ?? 1; // Fallback for demo
  const userIdString = userId.toString();
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
  const today = new Date().toISOString().split("T")[0];
  const { data: todayActivity } = useQuery({
    queryKey: ["/api/daily-activity", userId, today],
    queryFn: async () => {
      const response = await fetch(
        `/api/daily-activity/${userId}?startDate=${today}&endDate=${today}`,
      );
      if (!response.ok) return [];
      return response.json();
    },
  });

  const hasCheckedInToday = todayActivity && todayActivity.length > 0;

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", userId],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications", userId, "count"],
    queryFn: async () => {
      const response = await fetch(
        `/api/notifications/${userId}/count?unreadOnly=true`,
      );
      if (!response.ok) return { count: 0 };
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Badge checking system
  const checkBadgesMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/check-badges/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to check badges");
      return response.json();
    },
    onSuccess: (data) => {
      // Show toast notifications for newly awarded badges
      if (data.newBadges && data.newBadges.length > 0) {
        data.newBadges.forEach((userBadge: any) => {
          if (userBadge.badge) {
            toast({
              title: "🏆 New Badge Unlocked!",
              description: `${userBadge.badge.title}: ${userBadge.badge.description}`,
              variant: "default",
            });
          }
        });

        // Show summary toast if multiple badges
        if (data.newBadges.length > 1) {
          setTimeout(() => {
            toast({
              title: "🎉 Badge Streak!",
              description: `You've unlocked ${data.newBadges.length} new badges! Check the Badges page to see them all.`,
              variant: "default",
            });
          }, 2000);
        }
      }
    },
    onError: (error) => {
      console.error("Badge checking error:", error);
    },
  });

  // Check badges when dashboard loads
  useEffect(() => {
    if (userId && user) {
      // Delay badge checking by 1 second to let other data load first
      const timer = setTimeout(() => {
        checkBadgesMutation.mutate(userIdString);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userId, user]);

  // Fetch check-in history for the past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];

  const { data: checkInHistory } = useQuery({
    queryKey: ["/api/daily-activity", userId, "history"],
    queryFn: async () => {
      const response = await fetch(
        `/api/daily-activity/${userId}?startDate=${startDate}&endDate=${today}`,
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    },
  });

  const queryClient = useQueryClient();

  // Daily check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      const response = await fetch("/api/daily-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          date: today,
          xpEarned: 10, // Daily check-in XP reward
          lessonsCompleted: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to check in");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Daily Check-in Complete! 🎉",
        description:
          "You earned 10 XP for checking in today. Keep your streak going!",
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-activity", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-activity", userId, today],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-activity", userId, "history"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in Failed",
        description: error.message.includes("already checked in")
          ? "You've already checked in today! Come back tomorrow to continue your streak."
          : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate();
  };

  // Notification mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications", userId, "count"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notifications/${userId}/read-all`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark all as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications", userId, "count"],
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications", userId, "count"],
      });
    },
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-blue-100 to-blue-300  dark:from-gray-900 dark:via-blue-800 dark:to-gray-900 relative overflow-hidden">
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* LEFT SECTION */}
          <div className="flex items-start gap-3 lg:pl-6 xl:pl-10">
            {/* Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mt-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* TEXT + MOBILE ACTIONS */}
            <div className="flex flex-col gap-3 pt-4">
              {/* TEXT */}
              <div>
                <span className="text-xl text-gray-500 dark:text-white">
                  Welcome back,
                </span>

                <h2 className="text-4xl sm:text-2xl font-semibold">
                  <span className="text-primary">
                    {user?.firstName || "Professional"}
                  </span>
                  !
                </h2>

                <p className="text-sm sm:text-base text-gray-600 dark:text-white">
                  Manage your portfolio and continue learning
                </p>
              </div>

              {/* MOBILE ACTIONS */}
              <div className="flex items-center gap-2 flex-wrap lg:hidden">
                <Button size="sm" className="bg-green-500 text-white">
                  Checked
                </Button>

                <Button size="sm" variant="outline">
                  <History className="mr-1 h-4 w-4" />
                  History
                </Button>

                <Button size="icon" variant="ghost">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-3">
            <Button size="sm" className="bg-green-500 text-white">
              Checked
            </Button>

            <Button size="sm" variant="outline">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>

            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Profile Completion Notification */}
          <ProfileCompletionNotification />

          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Learning Heat Map */}
            <RealGoalHeatMap />

            {/* User Profile & Quick Actions Card */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-gray-900 border-slate-700 flex flex-col p-6">
              {/* User Info */}
              <div className="grid grid-cols-3 items-center  gap-6">
                {/* Avatar Section */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-25 w-25 overflow-hidden rounded-full">
                      <AvatarImage
                        src={
                          profile?.personalDetails?.photo ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`
                        }
                        alt="Profile"
                        className="rounded-full object-cover"
                      />
                      <AvatarFallback className="rounded-full text-2xl">
                        {user?.firstName?.charAt(0) || "U"}
                        {user?.lastName?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    {/* Golden Ring and Glow Effect */}
                    <div className="absolute inset-0 rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse-slow shadow-[0_0_20px_rgba(251,191,36,0.4)]"></div>
                  </div>
                </div>

                {/* User Name + Role */}
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-white">
                    {profile?.personalDetails?.fullName ||
                      `${user?.firstName || ""} ${
                        user?.lastName || ""
                      }`.trim() ||
                      "User Name"}
                  </h3>
                  <p className="text-slate-300 font-medium">
                    {profile?.personalDetails?.roleOrTitle || "System Engineer"}
                  </p>
                  <p className="text-slate-300 font-medium">
                    {profile?.contactDetails?.phone || "DOB"}
                  </p>
                  <p className="text-slate-300 font-medium">
                    {profile?.contactDetails?.email || "Email"}
                  </p>
                </div>

                {/* Animation Section */}
                <div className="flex justify-center">
                  <Player
                    autoplay
                    loop
                    src="https://lottie.host/808a860f-b6c9-4e5a-a7e2-659f5a45127c/ebhZk5XZe6.json"
                    style={{ height: "150px", width: "150px" }}
                  />
                </div>
              </div>

              {/* Quick Actions Component */}
              <QuickActions
                onAddCertification={() =>
                  console.log("Navigate to certification form")
                }
                onAddProject={() => console.log("Navigate to project form")}
                onAddExperience={() =>
                  console.log("Navigate to experience form")
                }
              />
            </Card>
          </div>
          {/* Stats Cards */}
          <StatsGrid userId={userIdString} />

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
            <ActivityCalendar userId={userIdString} />
          </section>

          {/* Learning Modules and Completed Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LearningModules userId={userIdString} />
            <CompletedCourses userId={userIdString} />
          </div>

          {/* Recent Badges */}
          <section>
            <RecentBadges userId={userIdString} />
          </section>

          {/* Skill Dashboard */}
          <section>
            <SkillRadarChart userId={userIdString} />
          </section>

          {/* Projects & Achievements */}
          <section>
            <ProjectsAchievements userId={userIdString} />
          </section>
        </div>

        {/* Footer */}
        <Footer />
      </main>
      // {/* NEW: Check-in History Overlay & Panel */}
      // {/* This is the semi-transparent background */}
      {showCheckInHistory && (
        <div
          className="fixed inset-0 z-40 bg-black/50 "
          onClick={() => setShowCheckInHistory(false)}
          aria-hidden="true"
        />
      )}
      {/* This is the vertical sidebar itself */}
      <div
        className={`
  fixed top-0 right-0 h-full z-50 w-96 bg-white dark:bg-gray-900 shadow-2xl 
  transform transition-transform duration-300 ease-in-out
  flex flex-col
  ${showCheckInHistory ? "translate-x-0" : "translate-x-full"}
`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-500 dark:text-white" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Check-in History
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCheckInHistory(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {checkInHistory && checkInHistory.length > 0 ? (
              checkInHistory.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{activity.xpEarned} XP
                      </div>
                    </div>
                    <CircleCheckBig className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-gray-500 dark:text-white">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No check-in history yet</p>
                <p className="text-sm">
                  Start your daily check-in streak today!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
