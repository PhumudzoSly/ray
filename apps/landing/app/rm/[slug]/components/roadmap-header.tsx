import { Button } from "@workspace/ui/components/button";
import { LightbulbIcon, Sparkles } from "lucide-react";
import { FeatureRequestDialog } from "./feature-request-dialog";

interface RoadmapHeaderProps {
  roadmap: {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
  };
  categories: string[];
}

export function RoadmapHeader({ roadmap, categories }: RoadmapHeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {roadmap.logoUrl ? (
                <img
                  src={roadmap.logoUrl}
                  alt="Logo"
                  className="h-10 w-10 rounded"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{roadmap.name}</h1>
                <p className="text-muted-foreground text-sm">
                  {roadmap.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
