import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "./user-profile-dropdown";
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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Forum", href: "/forum", icon: MessageCircle },
  { name: "Career Tools", href: "/career-tools", icon: Sparkles },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 relative inset-y-0 left-0 z-30 flex flex-col p-4">
      {/* Mobile close button */}
      {onClose && (
        <div className="lg:hidden flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
          <User className="text-white h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            knowme
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-3 mb-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs opacity-90">Total XP</span>
          <span className="text-sm font-bold">2,847</span>
        </div>
        <div className="flex items-center space-x-1">
          <Flame className="h-3 w-3 text-yellow-300" />
          <span className="text-xs">5 day streak</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            location === item.href ||
            (item.href === "/dashboard" && location === "/");

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
