import {
  Cpu,
  Fingerprint,
  Pencil,
  Settings2,
  Sparkles,
  Zap,
  GitBranch,
  RefreshCw,
  Activity,
  Workflow as WorkflowIcon,
  Link,
  BarChart3,
  Users,
  MessageSquare,
  Target,
  Calendar,
} from "lucide-react";

export function Workflow() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10  max-w-3xl space-y-6  md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Workflow Automation That Connects Everything
          </h2>
          <p className="text-lg">
            Ray AI automatically connects your entire product development
            workflow. From validation insights to customer feedback, everything
            flows seamlessly through intelligent automation that saves hours of
            manual work.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl lg:max-w-7xl divide-x divide-y border *:p-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="size-4" />
              <h3 className="text-sm font-medium">Auto Conversions</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Feedback automatically converts to features or issues. Feature
              requests become roadmap items instantly.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4" />
              <h3 className="text-sm font-medium">Dependency Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complex dependency chains automatically tracked with real-time
              blocking detection.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="size-4" />
              <h3 className="text-sm font-medium">Activity Feeds</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Activity tracking across all connected items with unified
              notifications.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <WorkflowIcon className="size-4" />
              <h3 className="text-sm font-medium">Smart Workflows</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered workflow suggestions based on team patterns and project
              context.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              <h3 className="text-sm font-medium">Impact Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatic impact assessment when changes affect multiple connected
              items.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <h3 className="text-sm font-medium">Feedback Loops</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automated feedback loops that connect customer insights back to
              development priorities.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="size-4" />
              <h3 className="text-sm font-medium">Goal Tracking</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatic progress tracking against validation goals and market
              objectives.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <h3 className="text-sm font-medium">Timeline Optimization</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered timeline optimization based on dependencies and team
              capacity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
