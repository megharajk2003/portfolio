import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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

interface AllBadgesDisplayProps {
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
    achieved: {
      border: "border-gray-300",
      bg: "bg-gradient-to-br from-gray-50 to-gray-100",
      text: "text-gray-700",
      glow: "shadow-sm",
    },
    unachieved: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      glow: "",
    },
  },
  rare: {
    achieved: {
      border: "border-blue-400",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      text: "text-blue-800",
      glow: "shadow-blue-200 shadow-md",
    },
    unachieved: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      glow: "",
    },
  },
  epic: {
    achieved: {
      border: "border-purple-400",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      text: "text-purple-800",
      glow: "shadow-purple-300 shadow-lg",
    },
    unachieved: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      glow: "",
    },
  },
  legendary: {
    achieved: {
      border: "border-yellow-400",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      text: "text-yellow-800",
      glow: "shadow-yellow-300 shadow-xl",
    },
    unachieved: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      glow: "",
    },
  },
};

const badgeCategories = {
  "Onboarding & Profile": ["achievement"],
  "Learning & Courses": ["course_completion", "milestone"],
  "Goals & Milestones": ["milestone"],
  "Streaks & Consistency": ["streak"],
  "Community & Engagement": ["achievement"],
  "Special Achievements": ["achievement"],
};

export default function AllBadgesDisplay({ userId }: AllBadgesDisplayProps) {
  // Fetch all available badges
  const { data: allBadges = [], isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  // Fetch user's earned badges
  const { data: userBadges = [], isLoading: userBadgesLoading } = useQuery<
    UserBadge[]
  >({
    queryKey: ["/api/users", userId, "badges"],
  });
  console.log("userBadges:", userBadges);
  const isLoading = badgesLoading || userBadgesLoading;

  // Create a set of earned badge IDs for quick lookup
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  // Group badges by category
  const groupedBadges = allBadges.reduce((acc, badge) => {
    let category = "Other";

    // Categorize badges based on title keywords and type
    if (
      badge.title.includes("Profile") ||
      badge.title.includes("Welcome") ||
      badge.title.includes("Bio") ||
      badge.title.includes("Picture") ||
      badge.title.includes("Experience") ||
      badge.title.includes("Education")
    ) {
      category = "Onboarding & Profile";
    } else if (
      badge.title.includes("Course") ||
      badge.title.includes("Lesson") ||
      badge.title.includes("Learning") ||
      badge.title.includes("Module") ||
      badge.type === "course_completion"
    ) {
      category = "Learning & Courses";
    } else if (badge.title.includes("Goal")) {
      category = "Goals & Milestones";
    } else if (
      badge.type === "streak" ||
      badge.title.includes("Streak") ||
      badge.title.includes("Daily") ||
      badge.title.includes("Weekly")
    ) {
      category = "Streaks & Consistency";
    } else if (
      badge.title.includes("Forum") ||
      badge.title.includes("Community")
    ) {
      category = "Community & Engagement";
    } else if (
      badge.title.includes("Badge") ||
      badge.title.includes("Superstar") ||
      badge.title.includes("Career") ||
      badge.title.includes("Resume")
    ) {
      category = "Special Achievements";
    } else if (
      badge.title.includes("Skill") ||
      badge.title.includes("Project") ||
      badge.title.includes("Portfolio")
    ) {
      category = "Skills & Projects";
    }

    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  // Sort badges within each category by rarity and then by name
  Object.keys(groupedBadges).forEach((category) => {
    groupedBadges[category].sort((a, b) => {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.title.localeCompare(b.title);
    });
  });

  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badge Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Badge Collection</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {earnedCount}/{totalCount}
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                completionPercentage >= 75
                  ? "bg-green-500"
                  : completionPercentage >= 50
                  ? "bg-yellow-500"
                  : completionPercentage >= 25
                  ? "bg-orange-500"
                  : "bg-gray-500"
              } text-white`}
            >
              {completionPercentage}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedBadges).map(([category, badges]) => {
            const categoryEarned = badges.filter((badge) =>
              earnedBadgeIds.has(badge.id)
            ).length;
            const categoryTotal = badges.length;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {category}
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    {categoryEarned}/{categoryTotal}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {badges.map((badge, index) => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    const IconComponent =
                      iconMap[badge.icon as keyof typeof iconMap] || Trophy;
                    const rarityStyle = isEarned
                      ? rarityColors[badge.rarity].achieved
                      : rarityColors[badge.rarity].unachieved;

                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`
                          relative p-3 rounded-xl border-2 ${
                            rarityStyle.border
                          } ${rarityStyle.bg} 
                          ${
                            rarityStyle.glow
                          } hover:scale-105 transition-all duration-200 cursor-pointer
                          ${!isEarned ? "opacity-60" : ""}
                        `}
                        whileHover={{ scale: 1.05 }}
                        title={`${badge.title}: ${badge.description}${
                          isEarned ? "" : " (Not earned yet)"
                        }`}
                      >
                        {/* Rarity indicator */}
                        <div className="absolute top-1 right-1">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1 py-0.5 ${rarityStyle.text} border-current`}
                          >
                            {badge.rarity.charAt(0).toUpperCase()}
                          </Badge>
                        </div>

                        {/* Badge icon */}
                        <div className="flex justify-center mb-2">
                          <div
                            className={`
                            w-10 h-10 rounded-full ${rarityStyle.bg} border-2 ${rarityStyle.border}
                            flex items-center justify-center
                          `}
                          >
                            <IconComponent
                              className={`h-5 w-5 ${rarityStyle.text}`}
                            />
                          </div>
                        </div>

                        {/* Badge info */}
                        <div className="text-center">
                          <h4
                            className={`text-xs font-semibold ${rarityStyle.text} mb-1 line-clamp-2`}
                          >
                            {badge.title}
                          </h4>

                          {/* XP reward */}
                          {badge.xpReward > 0 && (
                            <div
                              className={`flex items-center justify-center text-xs font-medium ${
                                isEarned ? "text-emerald-600" : "text-gray-400"
                              }`}
                            >
                              <Star className="h-2 w-2 mr-1" />+{badge.xpReward}
                            </div>
                          )}
                        </div>

                        {/* Earned indicator */}
                        {isEarned && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-2 w-2 text-white" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
