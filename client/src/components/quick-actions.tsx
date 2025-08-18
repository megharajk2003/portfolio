import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, Award, Play, ChevronRight } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "Add Experience",
      icon: Plus,
      onClick: () => console.log("Add experience"),
    },
    {
      label: "Add Project",
      icon: FolderPlus,
      onClick: () => console.log("Add project"),
    },
    {
      label: "Add Certification",
      icon: Award,
      onClick: () => console.log("Add certification"),
    },
    {
      label: "Start Learning",
      icon: Play,
      onClick: () => console.log("Start learning"),
      primary: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <Button
                key={index}
                variant={action.primary ? "default" : "outline"}
                className="w-full justify-between"
                onClick={action.onClick}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{action.label}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
