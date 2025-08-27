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
  X,
  Sparkles,
  MessageCircle,
  Target,
  ChevronRight,
  Folder,
  CheckCircle2,
} from "lucide-react";

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

  const userId = user?.id?.toString() ?? "1"; // Fallback for demo

  // Check if we're on a goal details page
  const isGoalDetailsPage =
    location.startsWith("/goal-tracker/") && location !== "/goal-tracker";
  const currentGoalId = isGoalDetailsPage ? location.split("/")[2] : null;

  // Fetch user stats for streak and XP display
  const { data: userStats } = useQuery({
    queryKey: ["/api/user-stats", userId],
    enabled: !!user,
  });

  // Fetch user goals for goal tracker section
  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  // Fetch current goal details for enhanced sidebar
  const { data: currentGoal } = useQuery<Goal>({
    queryKey: [`/api/goals/${currentGoalId}`],
    enabled: !!currentGoalId && !!user,
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

      <div className="gradient-primary rounded-xl p-4 mb-6 text-white shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs opacity-90 font-medium">Total XP</span>
          <span className="text-lg font-bold">
            {userStats?.totalXp?.toLocaleString() || "0"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">
              {userStats?.currentStreak || 0} day streak
            </span>
          </div>
          <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-300 rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.min(((userStats?.currentStreak || 0) / 7) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            location === item.href ||
            (item.href === "/dashboard" && location === "/") ||
            (item.href === "/goal-tracker" &&
              location.startsWith("/goal-tracker"));

          return (
            <Link key={item.name} href={item.href}>
              <div
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
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Portfolio Link */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/portfolio">
          <div
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors mb-4 shadow-sm"
            onClick={() => onClose && onClose()}
          >
            <ExternalLink className="h-5 w-5" />
            <span>View Portfolio</span>
          </div>
        </Link>

        {/* User Profile */}
        <UserProfileDropdown />
      </div>
    </aside>
  );
}
