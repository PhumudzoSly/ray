"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-muted/70 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-blue-800 p-1">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-lg">{description}</p>
      <p className="text-muted-foreground">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  // Example cards for demo
  const displayCards = cards || [
    {
      title: "Featured",
      description: "Discover amazing content",
      date: "Just now",
    },
    {
      title: "Popular",
      description: "Trending topics",
      date: "2 days ago",
    },
    {
      title: "New",
      description: "Latest updates and features",
      date: "Today",
    },
  ];

  // Stacking styles for each card
  const stackStyles = [
    "absolute top-0 left-0 z-10 opacity-60 grayscale pointer-events-none",
    "absolute top-6 left-6 z-20 opacity-80 grayscale-[0.5] pointer-events-none",
    "absolute top-12 left-12 z-30 opacity-100 grayscale-0 pointer-events-auto",
  ];

  return (
    <div className="relative h-48 w-[22rem]">
      {displayCards.map((card, idx) => (
        <div key={idx} className={stackStyles[idx]}>
          <DisplayCard {...card} />
        </div>
      ))}
    </div>
  );
}
