import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

export const priorities = [
  {
    id: "HIGH",
    name: "High",
    icon: ArrowUp,
    colorClass: "text-red-600",
  },
  {
    id: "MEDIUM",
    name: "Medium",
    icon: AlertTriangle,
    colorClass: "text-yellow-600",
  },
  {
    id: "LOW",
    name: "Low",
    icon: ArrowDown,
    colorClass: "text-green-600",
  },
] as const;
