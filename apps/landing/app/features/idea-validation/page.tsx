import { Badge } from "@workspace/ui/components/badge";
import { Sparkles, Target } from "lucide-react";
import IdeaValidationFeature from "../../../components/features/idea-validation";

export default function IdeaValidationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Idea Validation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Validate your SaaS idea
              <br />
              <span className="text-foreground">with confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Research your market, analyze competition, and validate your SaaS idea before investing time and resources.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <IdeaValidationFeature />
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to validate your idea?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start validating your SaaS idea today with our comprehensive research tools.
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