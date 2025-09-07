import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";

interface InsightCardProps {
  category: string;
  impact: number; // 0-100
  urgency?: number; // 0-100
  label?: string;
  description?: string;
  cost?: number; // USD
  variant?: "info" | "opportunity" | "threat" | "warning";
}

export function InsightCard({
  category,
  impact,
  urgency,
  label,
  description,
  cost,
  variant = "info",
}: InsightCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "opportunity":
        return {
          border: "border-green-500/20",
          bg: "bg-green-500/5",
          icon: <TrendingUp className="h-4 w-4 text-green-600" />,
          badgeVariant: "success" as const,
        };
      case "threat":
        return {
          border: "border-red-500/20",
          bg: "bg-red-500/5",
          icon: <TrendingDown className="h-4 w-4 text-red-600" />,
          badgeVariant: "destructive" as const,
        };
      case "warning":
        return {
          border: "border-yellow-500/20",
          bg: "bg-yellow-500/5",
          icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
          badgeVariant: "secondary" as const,
        };
      default:
        return {
          border: "border-muted",
          bg: "bg-background",
          icon: <Info className="h-4 w-4 text-blue-600" />,
          badgeVariant: "outline" as const,
        };
    }
  };

  const styles = getVariantStyles();

  const getImpactColor = () => {
    if (impact >= 80) return "text-red-600";
    if (impact >= 60) return "text-orange-600";
    if (impact >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card className={cn("border", styles.border, styles.bg)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {styles.icon}
            <Badge variant={styles.badgeVariant} className="text-xs">
              {category}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={cn("font-medium", getImpactColor())}>
              {impact}% impact
            </span>
            {urgency !== undefined && (
              <span className="text-muted-foreground">{urgency}% urgent</span>
            )}
          </div>
        </div>
      </CardHeader>
      {(label || description || cost !== undefined) && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {label && <h4 className="font-medium text-sm">{label}</h4>}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            {cost !== undefined && (
              <p className="text-sm font-medium">
                Cost Impact:{" "}
                <span className="text-red-600">${cost.toLocaleString()}</span>
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
