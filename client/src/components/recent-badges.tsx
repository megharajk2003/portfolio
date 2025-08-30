import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy,
  Award,
  Star,
  Crown,
  Target,
  Zap,
  BookOpen,
  Users,
  Calendar,
  Flame,
  CheckCircle2,
  Gift,
  User,
  Briefcase,
  FileText,
  Camera,
  Building,
  GraduationCap,
  CheckCircle,
  PlayCircle,
  Crosshair,
  TrendingUp,
  Heart,
  Shield,
  Database,
  Archive,
  Folder,
  FolderOpen,
  Globe,
  CalendarDays,
  CalendarCheck,
  MessageSquare,
  Compass,
  Infinity,
  Sparkles,
  Package,
  ExternalLink,
} from "lucide-react";

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: "course_completion" | "milestone" | "streak" | "achievement";
  criteria: any;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserBadge {
  id: string;
  userId: number;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

interface RecentBadgesProps {
  userId: number;
}

const iconMap = {
  Trophy,
  Award,
  Star,
  Crown,
  Target,
  Zap,
  BookOpen,
  Users,
  Calendar,
  Flame,
  CheckCircle2,
  Gift,
  User,
  Briefcase,
  FileText,
  Camera,
  Building,
  GraduationCap,
  CheckCircle,
  PlayCircle,
  Crosshair,
  TrendingUp,
  Heart,
  Shield,
  Database,
  Archive,
  Folder,
  FolderOpen,
  Globe,
  CalendarDays,
  CalendarCheck,
  MessageSquare,
  Compass,
  Infinity,
  Sparkles,
  Package,
};

const rarityColors = {
  common: {
    border: "border-gray-300",
    bg: "bg-gradient-to-br from-gray-50 to-gray-100",
    text: "text-gray-700",
    glow: "shadow-sm",
  },
  rare: {
    border: "border-blue-400",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    text: "text-blue-800",
    glow: "shadow-blue-200 shadow-md",
  },
  epic: {
    border: "border-purple-400",
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    text: "text-purple-800",
    glow: "shadow-purple-300 shadow-lg",
  },
  legendary: {
    border: "border-yellow-400",
    bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    text: "text-yellow-800",
    glow: "shadow-yellow-300 shadow-xl",
  },
};

export default function RecentBadges({ userId }: RecentBadgesProps) {
  const { data: userBadges = [], isLoading } = useQuery<UserBadge[]>({
    queryKey: [`/api/users/${userId}/badges`],
  });

  // Sort badges by earned date and take the 4 most recent
  const recentBadges = userBadges
    .sort(
      (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    )
    .slice(0, 4);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            🏆 Recent Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            🏆 Recent Badges
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              {userBadges.length} Total
            </Badge>
            <Link href="/badges">
              <Button variant="outline" size="sm" className="text-sm">
                Show All
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentBadges.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-2">No badges earned yet</p>
            <p className="text-sm text-gray-400">
              Complete courses and milestones to earn badges!
            </p>
            <Link href="/learning">
              <Button className="mt-4" size="sm">
                Start Learning
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentBadges.map((userBadge, index) => {
              const IconComponent =
                iconMap[userBadge.badge.icon as keyof typeof iconMap] || Trophy;
              const rarityStyle = rarityColors[userBadge.badge.rarity];

              return (
                <motion.div
                  key={userBadge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`
                    relative p-4 rounded-xl border-2 ${rarityStyle.border} ${rarityStyle.bg} 
                    ${rarityStyle.glow} hover:scale-105 transition-all duration-200 cursor-pointer
                  `}
                  whileHover={{ scale: 1.05 }}
                  title={`${userBadge.badge.title}: ${userBadge.badge.description}`}
                >
                  {/* Rarity indicator */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 ${rarityStyle.text} border-current`}
                    >
                      {userBadge.badge.rarity}
                    </Badge>
                  </div>

                  {/* Badge icon */}
                  <div className="flex justify-center mb-2">
                    <div
                      className={`
                      w-12 h-12 rounded-full ${rarityStyle.bg} border-2 ${rarityStyle.border}
                      flex items-center justify-center shadow-sm
                    `}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${rarityStyle.text}`}
                      />
                    </div>
                  </div>

                  {/* Badge info */}
                  <div className="text-center">
                    <h4
                      className={`text-sm font-semibold ${rarityStyle.text} mb-1 line-clamp-2`}
                    >
                      {userBadge.badge.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {userBadge.badge.description}
                    </p>

                    {/* XP reward */}
                    {userBadge.badge.xpReward > 0 && (
                      <div className="flex items-center justify-center text-xs text-emerald-600 font-medium">
                        <Star className="h-3 w-3 mr-1" />+
                        {userBadge.badge.xpReward} XP
                      </div>
                    )}
                  </div>

                  {/* Earned date */}
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <p className="text-xs text-gray-500">
                      {new Date(userBadge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
