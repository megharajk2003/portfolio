import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User, Flame, Eye, Trophy } from "lucide-react";

interface StatsGridProps {
  userId: string;
}

interface ProfileData {
  personalDetails?: {
    fullName?: string;
    roleOrTitle?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    summary?: string;
  };
  contactDetails?: {
    email?: string;
    phone?: string;
  };
}

interface UserStatsData {
  currentStreak?: number;
  portfolioViews?: number;
}

export default function StatsGrid({ userId }: StatsGridProps) {
  const { data: userStats } = useQuery<UserStatsData>({
    queryKey: ["/api/user-stats", userId],
  });

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ["/api/profile", userId],
  });

  const { data: skills } = useQuery({
    queryKey: ["/api/skills", userId],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects", userId],
  });

  const { data: workExperience } = useQuery({
    queryKey: ["/api/work-experience", userId],
  });

  const { data: education } = useQuery({
    queryKey: ["/api/education", userId],
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const requiredFields = [
      profile?.personalDetails?.fullName,
      profile?.personalDetails?.roleOrTitle,
      profile?.contactDetails?.phone,
      profile?.personalDetails?.location?.city || profile?.personalDetails?.location?.state || profile?.personalDetails?.location?.country,
      profile?.personalDetails?.summary,
    ];

    const optionalSections = [
      (skills as any[])?.length > 0,
      (projects as any[])?.length > 0,
      (workExperience as any[])?.length > 0,
      (education as any[])?.length > 0,
    ];

    const allItems = [...requiredFields, ...optionalSections];
    const completedItems = allItems.filter(Boolean).length;
    return Math.round((completedItems / allItems.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const stats = [
    {
      title: "Profile Completion",
      value: `${profileCompletion}%`,
      icon: User,
      color: "text-primary",
      bgColor: "bg-primary bg-opacity-10",
      progress: profileCompletion,
    },
    {
      title: "Learning Streak",
      value: `${userStats?.currentStreak || 5} days`,
      icon: Flame,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600 bg-opacity-10",
      subtitle: "+47 XP today",
      subtitleColor: "text-green-600",
    },
    {
      title: "Portfolio Views",
      value: userStats?.portfolioViews?.toLocaleString() || "1,234",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-600 bg-opacity-10",
      subtitle: "+12% this week",
      subtitleColor: "text-green-600",
    },
    {
      title: "Skills Mastered",
      value: "7 / 12",
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-600 bg-opacity-10",
      subtitle: "React.js next",
      subtitleColor: "text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              
              {stat.progress && (
                <div className="mt-4 w-full">
                  <Progress value={stat.progress} className="h-2" />
                </div>
              )}
              
              {stat.subtitle && (
                <p className={`text-sm mt-2 ${stat.subtitleColor}`}>
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
