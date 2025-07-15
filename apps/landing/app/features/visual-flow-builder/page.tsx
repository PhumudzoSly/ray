import { Badge } from "@workspace/ui/components/badge";
import { Palette } from "lucide-react";
import VisualFlowBuilderFeature from "../../../components/features/visual-flow-builder";

export default function VisualFlowBuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              <Palette className="w-4 h-4 mr-2" />
              Visual Flow Builder
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Design your app flows
              <br />
              <span className="text-foreground">visually</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create beautiful, interactive app flows with our drag-and-drop
              visual builder. Design user journeys that convert.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <VisualFlowBuilderFeature />
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to design your flows?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start building beautiful app flows with our visual builder today.
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
