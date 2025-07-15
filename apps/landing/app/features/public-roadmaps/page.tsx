import { Badge } from "@workspace/ui/components/badge";
import { Users } from "lucide-react";
import PublicRoadmapsFeature from "../../../components/features/public-roadmaps";

export default function PublicRoadmapsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              <Users className="w-4 h-4 mr-2" />
              Public Roadmaps
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Share your vision
              <br />
              <span className="text-foreground">with your community</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Build trust and transparency by sharing your product roadmap with
              your users and stakeholders.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <PublicRoadmapsFeature />
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to share your roadmap?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start building transparency and trust with your community today.
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
