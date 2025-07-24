import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { AlertCircle, ArrowLeft, Home, Search } from "lucide-react";

export default function RoadmapNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            {/* Title and Description */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Roadmap Not Found</h1>
              <p className="text-muted-foreground">
                The roadmap you're looking for doesn't exist or is not publicly available.
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>This could happen if:</p>
              <ul className="text-left space-y-1 list-disc list-inside">
                <li>The roadmap URL is incorrect</li>
                <li>The roadmap has been made private</li>
                <li>The roadmap has been deleted</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Roadmaps
                </Link>
              </Button>
            </div>

            {/* Back Link */}
            <div className="pt-4 border-t">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" className="text-muted-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Ray AI
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}