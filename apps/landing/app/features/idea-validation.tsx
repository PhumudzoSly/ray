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
  TrendingUp,
  DollarSign,
  ShieldAlert,
  HeartHandshake,
  Map,
  UsersRound,
} from "lucide-react";
import { ValidationChart } from "./validation-chart";
import { ValidationSection } from "./validation-section";

export default function IdeaValidation() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 max-w-3xl space-y-6">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Validate Your SaaS Idea with Confidence
          </h2>
          <p className="text-lg">
            Work alongside Ray's AI agent to thoroughly validate your concept,
            gather actionable insights, and prioritize development steps that
            matter most.
          </p>
        </div>
        <ValidationSection />
        <div className="relative mx-auto grid max-w-7xl  divide-x divide-y border *:p-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="size-4" />
              <h3 className="text-sm font-medium">Market Validation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered market size analysis, customer segmentation, and
              competitive landscape assessment to validate demand.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4" />
              <h3 className="text-sm font-medium">Business Model</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Validate revenue models, pricing strategies, and financial
              projections with AI-powered analysis.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UsersRound className="size-4" />
              <h3 className="text-sm font-medium">Target Audience</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Deep audience segmentation and persona analysis to identify your
              ideal customers.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              <h3 className="text-sm font-medium">Market Trends</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI analysis of market trends, technology shifts, and growth
              opportunities.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HeartHandshake className="size-4" />
              <h3 className="text-sm font-medium">Customer Needs</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Identify customer pain points, needs, and willingness to pay
              through AI analysis.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              <h3 className="text-sm font-medium">Product-Market Fit</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Measure and optimize product-market fit with AI-driven metrics and
              feedback analysis.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4" />
              <h3 className="text-sm font-medium">Risk Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Identify and mitigate business, market, and technical risks with
              AI-powered risk assessment.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Map className="size-4" />
              <h3 className="text-sm font-medium">Customer Journey</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Map and optimize the complete customer journey from awareness to
              conversion and beyond.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
