"use client";

import { useRouter } from "next/navigation";
import type { FC } from "react";
import { AlertCircle, ArrowRight, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { getRequiredPlanForFeature } from "@/lib/featureAccess";
import { cn } from "@/lib/utils";
import { GeneralFeature } from "@/types/features";

interface FeatureAccessDeniedProps {
  feature?: GeneralFeature;
  message?: string;
  requireFullPage?: boolean;
  disabled?: boolean;
}

export const FeatureAccessDenied: FC<FeatureAccessDeniedProps> = ({
  feature,
  message,
  requireFullPage = false,
  disabled = false,
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/checkout");
  };

  const requiredPlan = feature ? getRequiredPlanForFeature(feature) : null;

  const defaultMessage = feature
    ? `The "${feature.toLocaleLowerCase()}" feature requires the ${
        requiredPlan ? `**${requiredPlan}** plan` : "a higher plan"
      }.`
    : "This feature is not available in your current plan.";

  if (requireFullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <Card className="max-w-md w-full shadow-lg border-muted">
          <CardHeader className="flex flex-col items-center space-y-2 pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="text-center px-6">
            <h3 className="text-xl font-medium mb-2">Feature Unavailable</h3>
            <p className="text-muted-foreground">{message || defaultMessage}</p>
          </CardContent>
          <Separator />
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button className="w-full gap-2 group" onClick={handleUpgrade}>
              Upgrade Plan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Need help?{" "}
              <a href="/support" className="text-primary hover:underline">
                Contact support
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Minimal component-level UI
  return (
    <Alert
      className={cn(
        "flex items-center border border-primary/20 bg-primary/5 text-foreground",
        disabled && "opacity-70 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <AlertDescription className="text-sm font-medium">
            {message || defaultMessage}
          </AlertDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleUpgrade}>
          Upgrade
        </Button>
      </div>
    </Alert>
  );
};
