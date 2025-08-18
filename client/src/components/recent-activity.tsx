import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, FolderOpen, Flame } from "lucide-react";

interface RecentActivityProps {
  userId: string;
}

const mockActivities = [
  {
    id: "1",
    type: "completion",
    title: "Completed JavaScript ES6+ module",
    description: "Earned 150 XP • 2 hours ago",
    icon: Trophy,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    id: "2",
    type: "project",
    title: "Added Hospital Management System project",
    description: "Portfolio updated • 1 day ago",
    icon: FolderOpen,
    iconColor: "text-primary",
    iconBg: "bg-primary bg-opacity-10",
  },
  {
    id: "3",
    type: "streak",
    title: "5-day learning streak achieved!",
    description: "Keep it up! • 1 day ago",
    icon: Flame,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
  },
];

export default function RecentActivity({ userId }: RecentActivityProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const IconComponent = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                  <IconComponent className={`${activity.iconColor} h-4 w-4`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    <span className="font-medium">
                      {activity.title.split(' ')[0]}
                    </span>{' '}
                    {activity.title.split(' ').slice(1).join(' ')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
