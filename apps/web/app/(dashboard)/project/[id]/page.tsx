import { getProjectInsights } from "@/actions/project";
import { Badge } from "@workspace/ui/components/badge";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Bug,
  Target,
  Clock,
  User,
  Calendar,
  Activity,
} from "lucide-react";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  const insights = await getProjectInsights(id);

  if (!insights) {
    return <div>Project not found</div>;
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800";
      case "poor":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const healthMetrics = insights;

  return (
    <>
      {/* Project Health Stats */}
      <div className="space-y-4 mb-8">
        {/* Health Overview */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Project Health</h3>
              {healthMetrics.healthFactors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {healthMetrics.healthFactors.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-sm font-medium ${getHealthStatusColor(healthMetrics.healthStatus)}`}
              >
                {healthMetrics.overallHealthScore}%
              </Badge>
              {getHealthIcon(healthMetrics.healthStatus)}
            </div>
          </div>
        </div>

        {/* Priority & Timeline Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Critical Items */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Critical</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold">
                    {insights.criticalIssues + insights.criticalFeatures}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {insights.criticalIssues} issues,{" "}
                    {insights.criticalFeatures} features
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Items */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/20">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold">{insights.overdueIssues}</p>
                  <p className="text-xs text-muted-foreground">
                    issues past due
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Unassigned Items */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/20">
                <User className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold">
                    {insights.unassignedIssues + insights.unassignedFeatures}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {insights.unassignedIssues} issues,{" "}
                    {insights.unassignedFeatures} features
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">This Week</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold">
                    {insights.recentIssues + insights.recentFeatures}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {insights.recentIssues} issues, {insights.recentFeatures}{" "}
                    features
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Feature Phases */}
          <div className="border rounded-lg p-4 bg-card">
            <h4 className="text-sm font-medium mb-3">Feature Phases</h4>
            <div className="space-y-2">
              {insights.featurePhases.discovery > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Discovery</span>
                  <Badge variant="secondary" className="text-xs">
                    {insights.featurePhases.discovery}
                  </Badge>
                </div>
              )}
              {insights.featurePhases.planning > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Planning</span>
                  <Badge variant="secondary" className="text-xs">
                    {insights.featurePhases.planning}
                  </Badge>
                </div>
              )}
              {insights.featurePhases.development > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Development</span>
                  <Badge variant="default" className="text-xs">
                    {insights.featurePhases.development}
                  </Badge>
                </div>
              )}
              {insights.featurePhases.testing > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Testing</span>
                  <Badge variant="default" className="text-xs">
                    {insights.featurePhases.testing}
                  </Badge>
                </div>
              )}
              {insights.featurePhases.live > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Live</span>
                  <Badge variant="success" className="text-xs">
                    {insights.featurePhases.live}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Issue Statuses */}
          <div className="border rounded-lg p-4 bg-card">
            <h4 className="text-sm font-medium mb-3">Issue Statuses</h4>
            <div className="space-y-2">
              {insights.issueStatuses.backlog > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Backlog</span>
                  <Badge variant="secondary" className="text-xs">
                    {insights.issueStatuses.backlog}
                  </Badge>
                </div>
              )}
              {insights.issueStatuses.inProgress > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>In Progress</span>
                  <Badge variant="default" className="text-xs">
                    {insights.issueStatuses.inProgress}
                  </Badge>
                </div>
              )}
              {insights.issueStatuses.review > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Review</span>
                  <Badge variant="default" className="text-xs">
                    {insights.issueStatuses.review}
                  </Badge>
                </div>
              )}
              {insights.issueStatuses.completed > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Completed</span>
                  <Badge variant="success" className="text-xs">
                    {insights.issueStatuses.completed}
                  </Badge>
                </div>
              )}
              {insights.issueStatuses.blocked > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Blocked</span>
                  <Badge variant="destructive" className="text-xs">
                    {insights.issueStatuses.blocked}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Priorities */}
          <div className="border rounded-lg p-4 bg-card">
            <h4 className="text-sm font-medium mb-3">Timeline & Priorities</h4>
            <div className="space-y-2">
              {insights.upcomingDeadlines > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Due This Week</span>
                  <Badge variant="warning" className="text-xs">
                    {insights.upcomingDeadlines}
                  </Badge>
                </div>
              )}
              {insights.highPriorityIssues > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>High Priority Issues</span>
                  <Badge variant="destructive" className="text-xs">
                    {insights.highPriorityIssues}
                  </Badge>
                </div>
              )}
              {insights.highPriorityFeatures > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>High Priority Features</span>
                  <Badge variant="destructive" className="text-xs">
                    {insights.highPriorityFeatures}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span>Overall Health</span>
                <Badge variant="outline" className="text-xs">
                  {healthMetrics.overallHealthScore}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
