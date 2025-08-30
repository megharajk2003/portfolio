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
  ExternalLink,
  // Add any other icons your badges might use from lucide-react
} from "lucide-react";

// --- Type Definitions ---
interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserBadge {
  id: string;
  earnedAt: string;
  badge: BadgeInfo;
}

interface RecentBadgesProps {
  userId: string; // Changed to string to match dashboard usage
}

// --- Icon Mapping ---
const iconMap: { [key: string]: React.ElementType } = {
  Trophy,
  Award,
  Star,
  // Add other icons here as needed
};

// --- Rarity Styling ---
const rarityStyles = {
  common: {
    bg: "dark:bg-slate-700/50",
    iconBg: "bg-slate-200 dark:bg-slate-700",
    iconText: "text-slate-600 dark:text-slate-300",
    glow: "shadow-[0_0_10px_rgba(150,150,150,0.2)] hover:shadow-[0_0_15px_rgba(150,150,150,0.35)]",
  },
  rare: {
    bg: "dark:bg-blue-900/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconText: "text-blue-600 dark:text-blue-400",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.25)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
  },
  epic: {
    bg: "dark:bg-purple-900/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconText: "text-purple-600 dark:text-purple-400",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]",
  },
  legendary: {
    bg: "dark:bg-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconText: "text-amber-500 dark:text-amber-400",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)]",
  },
};

const BadgeItem = ({
  userBadge,
  index,
}: {
  userBadge: UserBadge;
  index: number;
}) => {
  const IconComponent = iconMap[userBadge.badge.icon] || Trophy;
  const styles = rarityStyles[userBadge.badge.rarity] || rarityStyles.common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative p-4 rounded-xl text-center border ${styles.glow} animate-[pulse_2s_infinite]`}
    >
      <div className="flex flex-col items-center">
        {/* ICON CIRCLE WITH GLOW */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${styles.iconBg} ${styles.glow} animate-[pulse_2s_infinite]`}
        >
          <IconComponent className={`h-8 w-8 ${styles.iconText}`} />
        </div>

        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">
          {userBadge.badge.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(userBadge.earnedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Rarity Badge */}
      <Badge
        className="absolute top-2 right-2 capitalize text-xs"
        variant="outline"
      >
        {userBadge.badge.rarity}
      </Badge>
    </motion.div>
  );
};

// --- Main Component ---
export default function RecentBadges({ userId }: RecentBadgesProps) {
  const { data: userBadges = [], isLoading } = useQuery<UserBadge[]>({
    queryKey: [`/api/users/${userId}/badges`],
    enabled: !!userId,
  });

  // Sort by most recent and take the top 4
  const recentBadges = React.useMemo(
    () =>
      userBadges
        .sort(
          (a, b) =>
            new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        )
        .slice(0, 4),
    [userBadges]
  );

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl text-purple-700 dark:text-purple-300">
            <Award className="mr-3 h-6 w-6 text-purple-600" />
            Recent Badges
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 px-3 py-1"
            >
              {userBadges.length} Total
            </Badge>
            <Link href="/badges">
              <Button
                variant="ghost"
                className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Show All
                <ExternalLink className="ml-1.5 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">
            Loading badges...
          </div>
        ) : recentBadges.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300 mb-2 font-medium">
              Your trophy case is empty
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Complete courses and learning goals to earn badges!
            </p>
            <Link href="/learning">
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Start Learning
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentBadges.map((badge, index) => (
              <BadgeItem key={badge.id} userBadge={badge} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
