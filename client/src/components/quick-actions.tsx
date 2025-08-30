// In quick-actions.tsx

import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, Award, Play, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

interface QuickActionsProps {
  onAddCertification?: () => void;
  onAddProject?: () => void;
  onAddExperience?: () => void;
}

export default function QuickActions({
  onAddCertification,
  onAddProject,
  onAddExperience,
}: QuickActionsProps) {
  const actions = [
    { label: "Add Experience", icon: Plus, onClick: onAddExperience },
    { label: "Add Project", icon: FolderPlus, onClick: onAddProject },
    { label: "Add Certification", icon: Award, onClick: onAddCertification },
  ];

  return (
    <div className="flex flex-col h-full">
      <Separator className="bg-slate-700 my-4" />
      <div className="space-y-3 flex-1">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="w-full flex items-center justify-between p-3 rounded-lg text-slate-300
                         hover:bg-amber-400/10 hover:text-amber-300
                         border border-transparent hover:border-amber-400/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="h-5 w-5" />
                <span className="font-semibold">{action.label}</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </button>
          );
        })}
      </div>
      <Link href="/learning" className="mt-4">
        <Button
          size="lg"
          className="w-full font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white
                     hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Learning
        </Button>
      </Link>
    </div>
  );
}
