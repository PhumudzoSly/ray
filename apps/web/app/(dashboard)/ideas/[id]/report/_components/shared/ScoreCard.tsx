import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

interface ScoreCardProps {
  label: string;
  value: number;
  maxValue?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

export function ScoreCard({
  label,
  value,
  maxValue = 100,
  variant = "default",
  size = "md",
}: ScoreCardProps) {
  const percentage = (value / maxValue) * 100;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-500/20 bg-green-500/5";
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/5";
      case "danger":
        return "border-red-500/20 bg-red-500/5";
      default:
        return "border-muted bg-background";
    }
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "p-3";
      case "lg":
        return "p-6";
      default:
        return "p-4";
    }
  };

  return (
    <Card className={cn("border", getVariantStyles())}>
      <CardContent className={getSizeStyles()}>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-bold", getScoreColor())}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground">/{maxValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}