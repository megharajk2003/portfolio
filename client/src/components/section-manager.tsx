import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryCard } from "./entry-card";
import { Plus, Edit, Zap } from "lucide-react";

interface SectionEntry {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  isVisible?: boolean;
}

interface SectionManagerProps {
  title: string;
  icon: React.ReactNode;
  entries: SectionEntry[];
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  showSuggestions?: boolean;
}

export function SectionManager({
  title,
  icon,
  entries = [],
  onAddEntry,
  onDeleteEntry,
  onEditEntry,
  onToggleVisibility,
  suggestions = [],
  onSelectSuggestion,
  showSuggestions = false,
}: SectionManagerProps) {
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    onSelectSuggestion?.(suggestion);
    setShowSuggestionsPanel(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit Heading
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {!Array.isArray(entries) || entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="mb-4">No {title.toLowerCase()} added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.isArray(entries) &&
              entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  title={entry.title}
                  subtitle={entry.subtitle}
                  description={entry.description}
                  isVisible={entry.isVisible}
                  onDelete={() => onDeleteEntry(entry.id)}
                  onToggleVisibility={
                    onToggleVisibility
                      ? () => onToggleVisibility(entry.id)
                      : undefined
                  }
                />
              ))}
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={onAddEntry}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </Button>

          {showSuggestions && suggestions.length > 0 && (
            <Button
              variant="default"
              onClick={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4" />
              <span>AI {title} Suggestions</span>
            </Button>
          )}
        </div>

        {showSuggestionsPanel && (
          <Card className="mt-4 border-purple-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 text-purple-800">
                Suggested {title}
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-2 hover:bg-purple-50"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Plus className="h-3 w-3 mr-2 text-purple-600" />
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
