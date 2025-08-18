import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCalendarProps {
  userId: string;
}

export default function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const { data: dailyActivity = [] } = useQuery({
    queryKey: ["/api/daily-activity", userId],
  });

  // Generate mock activity data for the last 28 days
  const generateActivityData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock activity intensity (0-3)
      const intensity = Math.floor(Math.random() * 4);
      data.push({
        date: date.toISOString().split('T')[0],
        xpEarned: intensity * 20,
        intensity,
      });
    }
    
    return data;
  };

  const activityData = dailyActivity.length > 0 ? dailyActivity : generateActivityData();

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-green-200";
      case 2:
        return "bg-green-400";
      case 3:
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Learning Activity</CardTitle>
          <span className="text-sm text-gray-500">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* GitHub-style contribution grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week days header */}
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs text-gray-500 text-center py-1">
              {day}
            </div>
          ))}
          
          {/* Activity squares */}
          {activityData.map((day, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${getIntensityClass(day.intensity || 0)}`}
              title={`${day.date}: ${day.xpEarned || 0} XP`}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded-sm" />
            <div className="w-3 h-3 bg-green-200 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
            <div className="w-3 h-3 bg-green-600 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
