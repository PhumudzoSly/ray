import {
  Cpu,
  Lock,
  Sparkles,
  Zap,
  Target,
  GitBranch,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Workflow,
  GitPullRequest,
} from "lucide-react";

export default function ProductDev() {
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto max-w-7xl space-y-8 px-6 md:space-y-12">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl font-semibold lg:text-5xl">
            Product Development That Scales
          </h2>
          <p className="mt-6 text-lg">
            Turn validated insights into actionable development workflows. From
            feature prioritization to team collaboration, Ray AI connects your
            entire product development process with AI-powered intelligence.
          </p>
        </div>
        <div className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3">
          <div className="[perspective:800px]">
            <div className="[transform:skewY(-2deg)skewX(-2deg)rotateX(6deg)]">
              <div className="aspect-[88/36] relative">
                <div className="[background-image:radial-gradient(var(--tw-gradient-stops,at_75%_25%))] to-background z-1 -inset-[4.25rem] absolute from-transparent to-75%"></div>
                <img
                  src="/app/project-manage.png"
                  className="absolute inset-0 z-10"
                  alt="product development illustration dark"
                  width={2797}
                  height={1137}
                />
                <img
                  src="/app/project-manage.png"
                  className="hidden dark:block"
                  alt="product development illustration dark"
                  width={2797}
                  height={1137}
                />
                <img
                  src="/app/project-manage.png"
                  className="dark:hidden"
                  alt="product development illustration light"
                  width={2797}
                  height={1137}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="relative mx-auto grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="size-4" />
              <h3 className="text-sm font-medium">Feature Prioritization</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              AI-powered feature prioritization based on market data and
              validation insights.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4" />
              <h3 className="text-sm font-medium">Issue Tracking</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Advanced issue tracking with dependency management and blocking
              detection.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <h3 className="text-sm font-medium">Milestone Planning</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Intelligent milestone planning with built-in risk assessment and
              timeline optimization.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <h3 className="text-sm font-medium">Team Collaboration</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Seamless team collaboration with activity tracking and real-time
              updates.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              <h3 className="text-sm font-medium">Analytics & Insights</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Comprehensive analytics with development velocity and team
              performance metrics.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Workflow className="size-4" />
              <h3 className="text-sm font-medium">Workflow Automation</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Automated workflows that connect validation insights to
              development tasks.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitPullRequest className="size-4" />
              <h3 className="text-sm font-medium">Git Integration</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Native Git integration with branch management and pull request
              tracking.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="size-4" />
              <h3 className="text-sm font-medium">Security & Compliance</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Enterprise-grade security with role-based access control and audit
              trails.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
