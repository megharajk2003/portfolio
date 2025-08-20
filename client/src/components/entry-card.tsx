import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";

interface EntryCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  isVisible?: boolean;
  onDelete: () => void;
  onToggleVisibility?: () => void;
}

export function EntryCard({
  title,
  subtitle,
  description,
  isVisible = true,
  onDelete,
  onToggleVisibility,
}: EntryCardProps) {
  return (
    <Card className="p-4 group hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex items-center space-x-2 text-gray-400">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {title}
              </h4>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleVisibility}
                  className="h-8 w-8"
                >
                  {isVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
