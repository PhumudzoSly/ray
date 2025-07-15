import { Badge } from "@workspace/ui/components/badge";
import {
  Sparkles,
  Target,
  Palette,
  FolderOpen,
  Bot,
  Rocket,
  Users,
  BarChart3,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: "idea-validation",
    name: "Idea Validation",
    icon: Target,
    description:
      "Validate your SaaS idea with market and competitor research tools.",
    href: "/features/idea-validation",
  },
  {
    id: "visual-flow-builder",
    name: "Visual Flow Builder",
    icon: Palette,
    description:
      "Design user journeys and app flows visually with drag-and-drop.",
    href: "/features/visual-flow-builder",
  },
  {
    id: "project-management",
    name: "Project Management",
    icon: FolderOpen,
    description:
      "Organize tasks, track progress, and collaborate with your team.",
    href: "/features/project-management",
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    icon: Bot,
    description: "Get intelligent help throughout your development process.",
    href: "/features/ai-assistant",
  },
  {
    id: "launch-orchestration",
    name: "Launch Orchestration",
    icon: Rocket,
    description: "Plan, coordinate, and execute your SaaS launch with ease.",
    href: "/features/launch-orchestration",
  },
  {
    id: "public-roadmaps",
    name: "Public Roadmaps",
    icon: Users,
    description: "Share your product vision and roadmap with your community.",
    href: "/features/public-roadmaps",
  },
  {
    id: "analytics-insights",
    name: "Analytics & Insights",
    icon: BarChart3,
    description: "Gain actionable insights from your SaaS data.",
    href: "/features/analytics-insights",
  },
  {
    id: "tech-stack-integration",
    name: "Tech Stack Integration",
    icon: LinkIcon,
    description: "Integrate Ray AI with your favorite tools and services.",
    href: "/features/tech-stack-integration",
  },
  {
    id: "issue-tracking",
    name: "Issue Tracking",
    icon: FolderOpen,
    description: "Track bugs and issues with an integrated system.",
    href: "/features/issue-tracking",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Features
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              The complete platform for
              <br />
              <span className="text-foreground">SaaS builders</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From idea validation to launch orchestration, Ray AI provides
              everything you need to build, manage, and scale successful SaaS
              products with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="block border border-border rounded-xl p-8 hover:shadow-lg transition-shadow bg-background hover:bg-muted"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-foreground">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  {feature.description}
                </p>
                <span className="text-primary font-medium">Learn more →</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground">
                Tech Stack Integrations
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">20+</div>
              <div className="text-sm text-muted-foreground">
                Visual Flow Node Types
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">11</div>
              <div className="text-sm text-muted-foreground">
                Validation Dimensions
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">4</div>
              <div className="text-sm text-muted-foreground">Launch Phases</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to build your next SaaS?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of builders who are validating ideas, managing
              projects, and launching successful products with Ray AI.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-lg font-medium transition-colors">
                Start Free Trial
              </button>
              <button className="border border-border text-foreground hover:bg-muted px-8 py-3 rounded-lg font-medium transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
