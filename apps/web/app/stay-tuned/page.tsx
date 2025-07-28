"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Rocket, Sparkles, Zap, Users, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StayTunedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <Rocket className="h-16 w-16 text-primary" />
                <Sparkles className="h-6 w-6 text-primary/60 absolute -top-2 -right-2" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Stay Tuned!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
              The first ever SaaS management tool is launching soon. Get ready
              to revolutionize how you build and manage your projects.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Build and deploy faster than ever
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless teamwork and communication
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Analytics & Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Data-driven decision making
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent automation and insights
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-4 pt-4">
              <p className="text-muted-foreground">
                While you wait, start thinking about your next big SaaS idea.
                The future of project management is almost here.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button
                  onClick={() => router.push("/auth/sign-out")}
                  variant="ghost"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
