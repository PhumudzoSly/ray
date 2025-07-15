import { Badge } from "@workspace/ui/components/badge";
import { Bot } from "lucide-react";
import AIAssistantFeature from "../../../components/features/ai-assistant";

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Your AI-powered
              <br />
              <span className="text-foreground">development partner</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get intelligent assistance throughout your development process
              with our advanced AI assistant.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <AIAssistantFeature />
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to work with AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start leveraging AI assistance to accelerate your development
              today.
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
