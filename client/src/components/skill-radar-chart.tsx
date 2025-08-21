import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, Code, Palette, Users } from "lucide-react";
// Remove unused type import since skills come from API

interface SkillRadarChartProps {
  userId: string;
}

interface SkillData {
  id: string;
  name: string;
  level: number;
  category: string;
}

export default function SkillRadarChart({ userId }: SkillRadarChartProps) {
  const { data: skills = [] } = useQuery<SkillData[]>({
    queryKey: ["/api/skills", userId],
  });

  // Convert level (1-5) to percentage (0-100%)
  const levelToPercentage = (level: number) => {
    return Math.round((level / 5) * 100);
  };

  // Calculate average skill levels by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category || "technical"]) {
      acc[skill.category || "technical"] = [];
    }
    acc[skill.category || "technical"].push(skill.level);
    return acc;
  }, {} as Record<string, number[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical": return "#4F46E5";
      case "soft": return "#059669"; 
      case "tools": return "#DC2626";
      case "domainspecific": return "#7C3AED";
      case "creative": return "#EA580C";
      default: return "#6B7280";
    }
  };

  const categoryAverages = Object.entries(skillsByCategory).map(([category, levels], index) => {
    const averageLevel = (levels as number[]).reduce((sum: number, level: number) => sum + level, 0) / levels.length;
    const averagePercentage = levelToPercentage(averageLevel);
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value: averagePercentage,
      fill: getCategoryColor(category.toLowerCase()),
      // Add unique identifier for each category
      name: category.charAt(0).toUpperCase() + category.slice(1),
      // Ensure different radius for visual separation
      innerRadius: 20 + (index * 15),
      outerRadius: 60 + (index * 10)
    };
  });

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return <Code className="h-4 w-4" />;
      case "design":
        return <Palette className="h-4 w-4" />;
      case "soft":
        return <Users className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  // Top skills for detailed view
  const topSkills = skills
    .sort((a, b) => b.level - a.level)
    .slice(0, 6)
    .map(skill => ({
      name: skill.name,
      level: levelToPercentage(skill.level),
      category: skill.category || "technical"
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Skill Categories Radial Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Skill Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={categoryAverages}>
                <PolarAngleAxis tick={false} />
                {categoryAverages.map((entry, index) => (
                  <RadialBar
                    key={entry.category}
                    dataKey="value"
                    cornerRadius={4}
                    fill={entry.fill}
                    background={{ fill: '#f1f5f9' }}
                    innerRadius={`${20 + index * 12}%`}
                    outerRadius={`${35 + index * 12}%`}
                  />
                ))}
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      return (
                        <div className="bg-white p-2 shadow-lg rounded-lg border">
                          <p className="font-medium">{payload[0].payload.category}</p>
                          <p className="text-primary">{payload[0].value}% proficiency</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Category Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {categoryAverages.map((category) => (
              <div key={category.category} className="flex items-center space-x-2">
                {getIconForCategory(category.category)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{category.category}</p>
                  <p className="text-xs text-gray-500">{category.value}% avg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Skills Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Top Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload[0]) {
                      return (
                        <div className="bg-white p-3 shadow-lg rounded-lg border">
                          <p className="font-medium">{label}</p>
                          <p className="text-primary">{payload[0].value}% proficiency</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="level" 
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}