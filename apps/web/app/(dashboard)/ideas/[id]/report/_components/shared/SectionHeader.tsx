interface SectionHeaderProps {
  title: string;
  score?: number;
  maxScore?: number;
  description?: string;
  subtitle?: string;
}

export function SectionHeader({
  title,
  score,
  maxScore = 100,
  description,
  subtitle,
}: SectionHeaderProps) {
  const getScoreAssessment = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "text-green-600" };
    if (score >= 70) return { text: "Good", color: "text-blue-600" };
    if (score >= 60) return { text: "Moderate", color: "text-yellow-600" };
    if (score >= 40) return { text: "Below Average", color: "text-orange-600" };
    return { text: "Poor", color: "text-red-600" };
  };

  return (
    <div className="border-b border-muted pb-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <h3 className="text-lg text-muted-foreground font-medium">
              {subtitle}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {score !== undefined && (
          <div className="text-right">
            <div className="text-3xl font-bold">
              {Math.round(score)}
              <span className="text-lg text-muted-foreground">/{maxScore}</span>
            </div>
            <div
              className={`text-sm font-medium ${getScoreAssessment(score).color}`}
            >
              {getScoreAssessment(score).text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
