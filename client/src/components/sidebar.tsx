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
  CheckCircle2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Forum", href: "/forum", icon: MessageCircle },
  { name: "Goal Tracker", href: "/goal-tracker", icon: Target },
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
  
  // Check if we're on a goal details page
  const isGoalDetailsPage = location.startsWith('/goal-tracker/') && location !== '/goal-tracker';
  const currentGoalId = isGoalDetailsPage ? location.split('/')[2] : null;
  
  // Fetch user goals for goal tracker section
  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!user
  });
  
  // Fetch current goal details for enhanced sidebar
  const { data: currentGoal } = useQuery<Goal>({
    queryKey: [`/api/goals/${currentGoalId}`],
    enabled: !!currentGoalId && !!user
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard</p>
          </div>
        </div>
        <ThemeSwitcher />
      </div>

      <div className="gradient-primary rounded-xl p-4 mb-6 text-white shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs opacity-90 font-medium">Total XP</span>
          <span className="text-lg font-bold">2,847</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">5 day streak</span>
          </div>
          <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="w-5/6 h-full bg-yellow-300 rounded-full"></div>
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
            (item.href === "/goal-tracker" && location.startsWith("/goal-tracker"));

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

      {/* Goal Tracker Enhanced Section */}
      {location.startsWith('/goal-tracker') && (
        <div className="mt-6 space-y-4">
          {isGoalDetailsPage && currentGoal ? (
            // Enhanced goal details sidebar
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <Link href="/goal-tracker">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-blue-600 hover:text-blue-700 mb-3 h-8"
                  onClick={() => onClose && onClose()}
                >
                  <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                  Back to All Goals
                </Button>
              </Link>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm text-blue-900 dark:text-blue-100 truncate">
                    {currentGoal.name}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700 dark:text-blue-300">Progress</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {Math.round((currentGoal.completedTopics / currentGoal.totalTopics) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(currentGoal.completedTopics / currentGoal.totalTopics) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {currentGoal.completedTopics} of {currentGoal.totalTopics} completed
                  </div>
                </div>
                
                {/* Categories Navigation */}
                {currentGoal.categories && currentGoal.categories.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                      Categories
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {currentGoal.categories.slice(0, 4).map((category) => {
                        const categoryProgress = category.totalTopics > 0 
                          ? (category.completedTopics / category.totalTopics) * 100 
                          : 0;
                        const isCompleted = categoryProgress === 100;
                        
                        return (
                          <div key={category.id} className="flex items-center gap-2 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                            {isCompleted ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <Folder className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate">
                                {category.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Progress value={categoryProgress} className="h-1 flex-1" />
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  {Math.round(categoryProgress)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {currentGoal.categories.length > 4 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 text-center py-1">
                          +{currentGoal.categories.length - 4} more categories
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Regular goals list for main goal tracker page
            goals && goals.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Your Goals
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {goals.slice(0, 5).map((goal) => {
                    const progress = goal.totalTopics > 0 ? (goal.completedTopics / goal.totalTopics) * 100 : 0;
                    const isActive = location === `/goal-tracker/${goal.id}`;
                    
                    return (
                      <Link key={goal.id} href={`/goal-tracker/${goal.id}`}>
                        <div
                          className={cn(
                            "p-3 rounded-lg transition-colors cursor-pointer",
                            isActive
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          onClick={() => onClose && onClose()}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">{goal.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-1 flex-1" />
                            <span className="text-xs font-medium">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {goal.completedTopics}/{goal.totalTopics} completed
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  
                  {goals.length > 5 && (
                    <div className="text-xs text-center py-2 text-gray-500">
                      +{goals.length - 5} more goals
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

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
