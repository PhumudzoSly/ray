import { Progress } from "@workspace/ui/components/progress";

interface MilestoneProgressProps {
  progress: number;
  issueCount: number;
  completedIssueCount: number;
  className?: string;
}

export function MilestoneProgress({
  progress,
  issueCount,
  completedIssueCount,
  className,
}: MilestoneProgressProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {completedIssueCount} of {issueCount} issues
        </span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
