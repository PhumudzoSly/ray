import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

export const actionItemStatus = [
  {
    id: "BACKLOG",
    name: "Backlog",
    icon: Circle,
    colorClass: "text-muted-foreground",
  },
  {
    id: "IN_PROGRESS",
    name: "In Progress",
    icon: Clock,
    colorClass: "text-blue-600",
  },
  {
    id: "COMPLETED",
    name: "Completed",
    icon: CheckCircle2,
    colorClass: "text-green-600",
  },
  {
    id: "BLOCKED",
    name: "Blocked",
    icon: XCircle,
    colorClass: "text-red-600",
  },
] as const;

export const actionItemPriority = [
  {
    id: "LOW",
    name: "Low",
    colorClass: "text-gray-600",
    bgClass: "bg-gray-100",
  },
  {
    id: "MEDIUM",
    name: "Medium",
    colorClass: "text-yellow-600",
    bgClass: "bg-yellow-100",
  },
  {
    id: "HIGH",
    name: "High",
    colorClass: "text-orange-600",
    bgClass: "bg-orange-100",
  },
  {
    id: "CRITICAL",
    name: "Critical",
    colorClass: "text-red-600",
    bgClass: "bg-red-100",
  },
] as const;
