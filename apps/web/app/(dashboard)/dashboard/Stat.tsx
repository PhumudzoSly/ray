import { Button } from "@workspace/ui/components/button";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import React from "react";

interface StatProps {
  title: string;
  value: number;
  message: string;
  icon: React.ElementType;
}

function Stat({ title, value, message, icon: Icon }: StatProps) {
  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4 flex items-center gap-6 transition-colors duration-200 dark:bg-muted/60 dark:border-muted/40">
      <div className="p-3 rounded-md bg-muted/50">
        <Icon className="h-8 w-8 text-muted-foreground" />
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

export default Stat;
