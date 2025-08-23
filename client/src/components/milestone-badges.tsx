import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Gift
} from "lucide-react";
import { motion } from "framer-motion";

interface MilestoneBadgesProps {
  userId: number;
}

interface UserBadge {
  id: string;
  earnedAt: string;
  badge: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    type: "course_completion" | "milestone" | "streak" | "achievement";
    xpReward: number;
  };
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

export default function MilestoneBadges({ userId }: MilestoneBadgesProps) {
  const { data: userBadges = [], isLoading } = useQuery<UserBadge[]>({
    queryKey: [`/api/users/${userId}/badges`],
  });

  // Sort badges by rarity and earned date
  const sortedBadges = userBadges.sort((a, b) => {
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    const rarityDiff = rarityOrder[b.badge.rarity] - rarityOrder[a.badge.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            🏆 Milestone Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            🏆 Milestone Badges
          </CardTitle>
          <Badge variant="secondary" className="px-3 py-1">
            {userBadges.length} Earned
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {userBadges.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-2">No badges earned yet</p>
            <p className="text-sm text-gray-400">Complete courses and milestones to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedBadges.map((userBadge, index) => {
              const IconComponent = iconMap[userBadge.badge.icon as keyof typeof iconMap] || Trophy;
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
                    <div className={`
                      w-12 h-12 rounded-full ${rarityStyle.bg} border-2 ${rarityStyle.border}
                      flex items-center justify-center shadow-sm
                    `}>
                      <IconComponent className={`h-6 w-6 ${rarityStyle.text}`} />
                    </div>
                  </div>
                  
                  {/* Badge info */}
                  <div className="text-center">
                    <h4 className={`text-sm font-semibold ${rarityStyle.text} mb-1 line-clamp-2`}>
                      {userBadge.badge.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {userBadge.badge.description}
                    </p>
                    
                    {/* XP reward */}
                    {userBadge.badge.xpReward > 0 && (
                      <div className="flex items-center justify-center text-xs text-emerald-600 font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        +{userBadge.badge.xpReward} XP
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