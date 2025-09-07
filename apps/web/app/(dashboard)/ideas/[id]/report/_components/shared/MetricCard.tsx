import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "status" | "percentage" | "date" | "currency";
  trend?: number; // Positive for up, negative for down
  size?: "sm" | "md" | "lg";
}

export function MetricCard({
  label,
  value,
  variant = "default",
  trend,
  size = "md",
}: MetricCardProps) {
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

  const formatValue = () => {
    switch (variant) {
      case "percentage":
        return typeof value === "number" ? `${value}%` : value;
      case "currency":
        return typeof value === "number" ? `$${value.toLocaleString()}` : value;
      default:
        return value;
    }
  };

  const getStatusBadge = () => {
    if (variant === "status") {
      const status = String(value).toLowerCase();
      switch (status) {
        case "complete":
        case "completed":
        case "success":
          return <Badge variant="success">{value}</Badge>;
        case "pending":
        case "in_progress":
          return <Badge variant="secondary">{value}</Badge>;
        case "failed":
        case "error":
          return <Badge variant="destructive">{value}</Badge>;
        default:
          return <Badge variant="outline">{value}</Badge>;
      }
    }
    return null;
  };

  return (
    <Card>
      <CardContent className={getSizeStyles()}>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {variant === "status" ? (
            getStatusBadge()
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatValue()}</span>
              {trend !== undefined && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend > 0
                      ? "text-green-600"
                      : trend < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                  )}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
