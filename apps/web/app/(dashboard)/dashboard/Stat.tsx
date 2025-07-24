import { Button } from "@workspace/ui/components/button";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import React from "react";

interface StatProps {
  title: string;
  value: number;
  message: string;
  icon: React.ElementType;
  iconColor?: string;
}

function Stat({ title, value, message, icon: Icon, iconColor }: StatProps) {
  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4 flex items-center gap-6 transition-colors duration-200 dark:bg-muted/60 dark:border-muted/40">
      <div className="p-3 rounded-md bg-muted/50">
        <Icon className={`h-8 w-8 ${iconColor || "text-muted-foreground"}`} />
      </div>
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">
          {value}
          <span className="ml-2 font-normal text-xs text-muted-foreground">
            {message}
          </span>
        </p>
      </div>
    </div>
  );
}

interface AdvancedStatProps {
  title: string;
  total: number;
  completed: number;
  completionRate?: number;
  icon: React.ElementType;
  iconColor?: string;
}

export function AdvancedStat({
  title,
  total,
  completed,
  completionRate,
  icon: Icon,
  iconColor,
}: AdvancedStatProps) {
  const rate = completionRate ?? (total > 0 ? (completed / total) * 100 : 0);

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4 transition-colors duration-200 dark:bg-muted/60 dark:border-muted/40">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-2 rounded-md bg-muted/50">
          <Icon className={`h-6 w-6 ${iconColor || "text-muted-foreground"}`} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium">{title}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{completed}</span>
            <span className="text-sm text-muted-foreground">of {total}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {rate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default Stat;
