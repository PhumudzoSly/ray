interface ReportSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ReportSection({
  children,
  className = "",
}: ReportSectionProps) {
  return (
    <div className={`prose prose-sm max-w-none space-y-4 ${className}`}>
      {children}
    </div>
  );
}

interface ReportParagraphProps {
  children: React.ReactNode;
  emphasis?: boolean;
}

export function ReportParagraph({
  children,
  emphasis = false,
}: ReportParagraphProps) {
  return (
    <p
      className={`leading-relaxed ${emphasis ? "font-medium text-foreground" : "text-muted-foreground"}`}
    >
      {children}
    </p>
  );
}

interface ReportListProps {
  items: string[];
  ordered?: boolean;
  compact?: boolean;
}

export function ReportList({
  items,
  ordered = false,
  compact = false,
}: ReportListProps) {
  const ListComponent = ordered ? "ol" : "ul";

  return (
    <ListComponent
      className={`space-y-1 ${compact ? "text-sm" : ""} ${ordered ? "list-decimal" : "list-disc"} list-inside`}
    >
      {items.map((item, index) => (
        <li key={index} className="text-muted-foreground leading-relaxed">
          {item}
        </li>
      ))}
    </ListComponent>
  );
}

interface ReportHighlightProps {
  children: React.ReactNode;
  type?: "success" | "warning" | "info" | "danger";
}

export function ReportHighlight({
  children,
  type = "info",
}: ReportHighlightProps) {
  const styles = {
    success:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    danger:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  };

  return (
    <div className={`p-3 border-l-4 rounded-r ${styles[type]}`}>{children}</div>
  );
}
