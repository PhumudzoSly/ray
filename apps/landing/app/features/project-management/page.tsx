import { Badge } from "@workspace/ui/components/badge";
import { FolderOpen } from "lucide-react";
import ProjectManagementFeature from "../../../components/features/project-management";

export default function ProjectManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              <FolderOpen className="w-4 h-4 mr-2" />
              Project Management
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Manage your projects
              <br />
              <span className="text-foreground">efficiently</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Organize tasks, track progress, and collaborate with your team in
              one unified platform.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <ProjectManagementFeature />
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to manage your projects?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start organizing your projects and collaborating with your team
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
