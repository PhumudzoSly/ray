import { Button } from "@workspace/ui/components/button";
import { BarChart3, Brain, Sparkles } from "lucide-react";
import { FeatureRequestDialog } from "./feature-request-dialog";

interface RoadmapHeaderProps {
  roadmap: {
    _id: string;
    name: string;
    description: string;
    logoUrl?: string;
  };
  categories: string[];
}

export function RoadmapHeader({ roadmap, categories }: RoadmapHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {roadmap.logoUrl ? (
                <img
                  src={roadmap.logoUrl}
                  alt="Logo"
                  className="h-10 w-10 rounded-md"
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{roadmap.name}</h1>
                <p className="text-muted-foreground">{roadmap.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Stats</span>
            </Button>
            <FeatureRequestDialog
              roadmapId={roadmap._id}
              categories={categories}
              roadmapName={roadmap.name}
              trigger={
                <Button variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Request Feature</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
