import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { ThemeSwitcher } from "./theme-switcher";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Cog,
  FolderOpen,
  BookOpen,
  ExternalLink,
  Flame,
  Award,
  X,
  Sparkles,
  MessageCircle,
  Target,
  ChevronRight,
  Folder,
  CheckCircle2,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Forum", href: "/forum", icon: MessageCircle },
  { name: "Goal Tracker", href: "/goals", icon: Target },
  { name: "Career Tools", href: "/career-tools", icon: Sparkles },
];

interface Goal {
  id: string;
  name: string;
  totalTopics: number;
  completedTopics: number;
  categories?: Array<{
    id: string;
    name: string;
    totalTopics: number;
    completedTopics: number;
  }>;
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userId = user?.id?.toString() ?? "1"; // Fallback for demo
  const isAdmin = user?.email === "admin@email.com";

  // Define which links to hide for the admin
  const adminHiddenLinks = [
    "Learning",
    "Goal Tracker",
    "Career Tools",
    "Dashboard",
    "Profile",
  ];

  // Filter the navigation array based on the admin status
  const filteredNavigation = navigation.filter(
    (item) => !isAdmin || !adminHiddenLinks.includes(item.name)
  ); // Check if we're on a goal details page

  const isGoalDetailsPage =
    location.startsWith("/goal-tracker/") && location !== "/goal-tracker";
  const currentGoalId = isGoalDetailsPage ? location.split("/")[2] : null; // Fetch user stats for streak and XP display

  const { data: userStats } = useQuery({
    queryKey: ["/api/user-stats", userId],
    enabled: !!user,
  }); // Fetch user goals for goal tracker section

  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!user,
  }); // Fetch current goal details for enhanced sidebar

  const { data: currentGoal } = useQuery<Goal>({
    queryKey: [`/api/goals/${currentGoalId}`],
    enabled: !!currentGoalId && !!user,
  });

  // Fetch profile data to get the photo URL
  const { data: profile } = useQuery({
    queryKey: ["/api/profile", userId],
    enabled: !!user,
  });

  return (
    <aside className="w-64 h-screen bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 relative inset-y-0 left-0 z-30 flex flex-col p-4">
            {/* Mobile close button */}     
      {onClose && (
        <div className="lg:hidden flex justify-end mb-4">
                   
          <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />         
          </Button>
                 
        </div>
      )}
            {/* Logo */}     
      <div className="flex items-center justify-between mb-8">
               
        <div className="flex items-center space-x-3">
                   
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                        <User className="text-white h-5 w-5" />         
          </div>
                   
          <div>
                       
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            knowme            
            </h1>
                   
            <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dashboard            
            </p>
                     
          </div>
                 
        </div>
                <ThemeSwitcher />     
      </div>
           
      {!isAdmin && (
        <div className="gradient-primary rounded-xl p-4 mb-6 text-white shadow-lg border border-white/20">
                 
          <div className="flex items-center justify-between mb-2">
                     
            <span className="text-xs opacity-90 font-medium">Total XP</span>   
                 
            <span className="text-lg font-bold">
              {(userStats as { totalXp?: number })?.totalXp?.toLocaleString() ||
                "0"}
            </span>
                   
          </div>
          <div className="flex items-center justify-between">
                     
            <div className="flex items-center space-x-1">
                          <Flame className="h-4 w-4 text-yellow-300" />         
               
              <span className="text-sm font-medium">
                {(userStats as { currentStreak?: number })?.currentStreak || 0}{" "}
                day streak    
              </span>
                       
            </div>
                     
            <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
                         
              <div
                className="h-full bg-yellow-300 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (((userStats as { currentStreak?: number })
                      ?.currentStreak || 0) /
                      7) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
                       
            </div>
                   
          </div>
        </div>
      )}
            {/* Navigation */}     
      <nav className="space-y-2">
        {/* Use the filteredNavigation array here */}       
        {filteredNavigation.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            location === item.href ||
            (item.href === "/dashboard" && location === "/") ||
            (item.href === "/goal-tracker" &&
              location.startsWith("/goal-tracker"));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => onClose && onClose()}
            >
                              <IconComponent className="h-5 w-5" />               
              <span>{item.name}</span>               
              {item.name === "Learning" && (
                <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                      New                  
                </span>
              )}
                           
            </Link>
          );
        })}
                        {/* Admin Navigation */}       
        {isAdmin && (
          <>
                       
            <div className="px-4 py-2">
                           
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin Area
              </p>
                         
            </div>
                       
                       
            <Link href="/admin/courses">
                           
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  location === "/admin/courses" ||
                    location.startsWith("/admin/courses/") ||
                    location.startsWith("/admin/modules/")
                    ? "bg-red-600 text-white"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
                onClick={() => onClose && onClose()}
              >
                                <BookOpen className="h-5 w-5" />               
                <span>Courses</span>             
              </div>
                         
            </Link>
                       
            <Link href="/admin/forum">
                       
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  location === "/admin/forum"
                    ? "bg-red-600 text-white"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
                onClick={() => onClose && onClose()}
              >
                                <MessageCircle className="h-5 w-5" />           
                    <span>Forum manage</span>             
              </div>
                         
            </Link>
                       
            <Link href="/admin/users">
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  location === "/admin/users"
                    ? "bg-red-600 text-white"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
                onClick={() => onClose && onClose()}
              >
                <User className="h-5 w-5" />
                <span>Users</span>
              </div>
            </Link>
            <Link href="/admin/badges">
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  location === "/admin/badges"
                    ? "bg-red-600 text-white"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
                onClick={() => onClose && onClose()}
              >
                <Award className="h-5 w-5" />
                <span>Badges</span>
              </div>
            </Link>
            <Link href="/admin/instructors">
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  location === "/admin/instructors"
                    ? "bg-red-600 text-white"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
                onClick={() => onClose && onClose()}
              >
                <GraduationCap className="h-5 w-5" />
                <span>Instructors</span>
              </div>
            </Link>
                       
            <div className="px-4 py-2 mt-2">
                           
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800 w-full justify-center"
              >
                                Admin Access              
              </Badge>
                         
            </div>
                     
          </>
        )}
             
      </nav>
            {/* Portfolio Link */}     
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
           {" "}
        {!isAdmin && (
          <Link href="/portfolio">
                     
            <div
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors mb-4 shadow-sm"
              onClick={() => onClose && onClose()}
            >
                          <ExternalLink className="h-5 w-5" />           
              <span>View Portfolio</span>         
            </div>
                   
          </Link>
        )}
                {/* User Profile */}
                <UserProfileDropdown />     
      </div>
         
    </aside>
  );
}