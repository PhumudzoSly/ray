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
  Link,
} from "lucide-react";

import IdeaValidationFeature from "../../components/features/idea-validation";
import VisualFlowBuilderFeature from "../../components/features/visual-flow-builder";
import ProjectManagementFeature from "../../components/features/project-management";
import AIAssistantFeature from "../../components/features/ai-assistant";
import LaunchOrchestrationFeature from "../../components/features/launch-orchestration";
import PublicRoadmapsFeature from "../../components/features/public-roadmaps";
import AnalyticsInsightsFeature from "../../components/features/analytics-insights";
import TechStackIntegrationFeature from "../../components/features/tech-stack-integration";
import IssueTracking from "@/components/features/issue-tracking";

const categories = [
  { id: "validation", name: "Validation", icon: Target },
  { id: "design", name: "Design", icon: Palette },
  { id: "management", name: "Management", icon: FolderOpen },
  { id: "ai", name: "AI", icon: Bot },
  { id: "launch", name: "Launch", icon: Rocket },
  { id: "community", name: "Community", icon: Users },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "integration", name: "Integration", icon: Link },
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

      {/* Category Navigation */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="px-4 py-2 hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="space-y-20">
          <IdeaValidationFeature />
          {/* <IssueTracking /> */}
          <VisualFlowBuilderFeature />
          <ProjectManagementFeature />
          <AIAssistantFeature />
          <LaunchOrchestrationFeature />
          <PublicRoadmapsFeature />
          <AnalyticsInsightsFeature />
          <TechStackIntegrationFeature />
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
