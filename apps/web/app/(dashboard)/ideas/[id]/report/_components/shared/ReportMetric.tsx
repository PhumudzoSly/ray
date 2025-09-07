interface ReportMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  inline?: boolean;
}

export function ReportMetric({
  label,
  value,
  unit,
  description,
  inline = false,
}: ReportMetricProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") {
      // If it's already a formatted string (like "$5.1B"), return as-is
      return val;
    }

    if (typeof val === "number") {
      // Round numbers to appropriate precision
      if (val >= 1000000000) {
        return `${(val / 1000000000).toFixed(1)}B`;
      }
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      if (val % 1 !== 0) {
        return Math.round(val * 100) / 100;
      }
      return val;
    }
    return val;
  };

  if (inline) {
    return (
      <span className="font-medium">
        {label}:{" "}
        <strong>
          {formatValue(value)}
          {unit}
        </strong>
        {description && (
          <span className="text-muted-foreground"> ({description})</span>
        )}
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {label}:
        </span>
        <span className="font-bold text-lg">
          {formatValue(value)}
          {unit}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground pl-2">{description}</p>
      )}
    </div>
  );
}
