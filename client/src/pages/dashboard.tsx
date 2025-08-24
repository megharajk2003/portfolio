import { useState } from "react";
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
import GoalHeatMap from "@/components/goal-heat-map";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCheckInHistory, setShowCheckInHistory] = useState(false);

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
  const today = new Date().toISOString().split("T")[0];
  const { data: todayActivity } = useQuery({
    queryKey: ["/api/daily-activity", userId, today],
    queryFn: async () => {
      const response = await fetch(
        `/api/daily-activity/${userId}?startDate=${today}&endDate=${today}`
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
      const response = await fetch(`/api/notifications/${userId}/count?unreadOnly=true`);
      if (!response.ok) return { count: 0 };
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch check-in history for the past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];

  const { data: checkInHistory } = useQuery({
    queryKey: ["/api/daily-activity", userId, "history"],
    queryFn: async () => {
      const response = await fetch(
        `/api/daily-activity/${userId}?startDate=${startDate}&endDate=${today}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  });

  const { toast } = useToast();
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
          userId: parseInt(userId),
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
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId, 'count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notifications/${userId}/read-all`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId, 'count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId, 'count'] });
    },
  });
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
                  : "Daily Check In"}
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

              {/* Check-in History Button */}
              <Button
                onClick={() => setShowCheckInHistory(!showCheckInHistory)}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <History className="mr-2 h-4 w-4" />
                History
                {showCheckInHistory ? (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </Button>

              {/* Mobile History Button */}
              <Button
                onClick={() => setShowCheckInHistory(!showCheckInHistory)}
                variant="ghost"
                size="icon"
                className="sm:hidden"
                title="Check-in History"
              >
                <History className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount && unreadCount.count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount.count > 9 ? '9+' : unreadCount.count}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between p-2">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount && unreadCount.count > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 10).map((notification: any) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsReadMutation.mutate(notification.id);
                          }
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="text-sm font-medium truncate">
                                {notification.title}
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification.id);
                                }}
                                disabled={markAsReadMutation.isPending}
                                className="p-1 h-6 w-6"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                              disabled={deleteNotificationMutation.isPending}
                              className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="p-4 text-center text-gray-500">
                      No notifications yet
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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

          {/* Recent Badges */}
          <section>
            <RecentBadges userId={userId} />
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

      {/* NEW: Check-in History Overlay & Panel */}
      {/* This is the semi-transparent background */}
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
            <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
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
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
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
