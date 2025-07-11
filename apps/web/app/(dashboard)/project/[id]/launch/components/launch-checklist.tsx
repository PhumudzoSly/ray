"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { CheckCircle, Clock, Calendar } from "lucide-react";

interface ChecklistItem {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "skipped";
  isRequired: boolean;
  category: string;
  order: number;
  dueDate?: string;
}

interface LaunchChecklistProps {
  checklistItems: ChecklistItem[];
  onToggleItem: (itemId: string, status: string) => void;
}

const categoryIcons = {
  technical: "🔧",
  content: "📝",
  legal: "⚖️",
  marketing: "📢",
  analytics: "📊",
  support: "🎧",
};

const categoryColors = {
  technical: "#3b82f6",
  content: "#10b981",
  legal: "#f59e0b",
  marketing: "#ef4444",
  analytics: "#8b5cf6",
  support: "#06b6d4",
};

export function LaunchChecklist({
  checklistItems,
  onToggleItem,
}: LaunchChecklistProps) {
  const handleToggle = (itemId: string, currentStatus: string) => {
    let newStatus: string;
    if (currentStatus === "completed") {
      newStatus = "pending";
    } else if (currentStatus === "in-progress") {
      newStatus = "completed";
    } else {
      newStatus = "in-progress";
    }
    onToggleItem(itemId, newStatus);
  };

  // Group items by category
  const groupedItems = checklistItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  if (checklistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No checklist items yet</h3>
        <p className="text-muted-foreground">
          Generate a launch plan to see your personalized checklist
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([category, items]) => {
        const completedCount = items.filter(
          (item) => item.status === "completed"
        ).length;

        return (
          <div key={category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {categoryIcons[category as keyof typeof categoryIcons] || "📋"}
              </span>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    categoryColors[category as keyof typeof categoryColors] ||
                    "#6b7280",
                }}
              />
              <h2 className="font-medium text-foreground capitalize">
                {category}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{items.length}
              </Badge>
            </div>

            {/* Category Items */}
            <div className="space-y-2">
              {items
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <div
                    key={item._id}
                    className={`group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 bg-card border border-border hover:border-border/80 hover:shadow-sm hover:bg-accent/50 cursor-pointer select-none ${
                      item.status === "completed" ? "opacity-60" : ""
                    }`}
                    onClick={() => handleToggle(item._id, item.status)}
                  >
                    {/* Checkbox and Status Icons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Checkbox
                        checked={item.status === "completed"}
                        onCheckedChange={() =>
                          handleToggle(item._id, item.status)
                        }
                        className="h-4 w-4"
                      />
                      {item.status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {item.status === "in-progress" && (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate text-sm">
                          {item.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {item.status}
                        </Badge>
                      </div>

                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="w-full bg-muted rounded-full h-1">
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                item.status === "completed"
                                  ? 100
                                  : item.status === "in-progress"
                                    ? 50
                                    : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.dueDate}
                        </div>
                      )}
                      <Badge
                        variant={
                          item.priority === "high"
                            ? "destructive"
                            : item.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                      {item.isRequired && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
