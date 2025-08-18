import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, Code, Palette, Users } from "lucide-react";
import type { Skill } from "@shared/schema";

interface SkillRadarChartProps {
  userId: string;
}

export default function SkillRadarChart({ userId }: SkillRadarChartProps) {
  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills", userId],
  });

  // Calculate average skill levels by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category || "technical"]) {
      acc[skill.category || "technical"] = [];
    }
    acc[skill.category || "technical"].push(skill.level);
    return acc;
  }, {} as Record<string, number[]>);

  const categoryAverages = Object.entries(skillsByCategory).map(([category, levels]) => {
    const average = Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length);
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value: average,
      fill: category === "technical" ? "#4F46E5" : category === "design" ? "#7C3AED" : "#059669"
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
      level: skill.level,
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
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={categoryAverages}>
                <PolarAngleAxis tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#4F46E5"
                />
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