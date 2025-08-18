import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SkillChartProps {
  userId: string;
}

export default function SkillChart({ userId }: SkillChartProps) {
  const { data: skills = [] } = useQuery({
    queryKey: ["/api/skills", userId],
  });

  // Show only top skills or mock data if no skills exist
  const displaySkills = skills.length > 0 ? skills.slice(0, 4) : [
    { id: "1", name: "JavaScript", level: 90, userId },
    { id: "2", name: "React", level: 75, userId },
    { id: "3", name: "Node.js", level: 60, userId },
    { id: "4", name: "MongoDB", level: 45, userId },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skills Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displaySkills.map((skill) => (
            <div key={skill.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{skill.name}</span>
                <span className="text-gray-500">{skill.level}%</span>
              </div>
              <Progress 
                value={skill.level} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
