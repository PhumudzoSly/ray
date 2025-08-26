import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Alert } from "@workspace/ui/components/alert";
import { ExternalLink, Bell, Shield, CheckCircle } from "lucide-react";

interface SubscriptionAlertProps {
  portalUrl: string;
}

export function SubscriptionAlert({ portalUrl }: SubscriptionAlertProps) {
  return (
    <Alert className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 shadow-sm rounded-xl overflow-hidden">
      <div className="relative p-6">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <CheckCircle
                className="h-6 w-6 text-primary"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="font-semibold text-lg mb-1">
                Active Subscription
              </div>
              <p className="text-sm text-muted-foreground">
                Manage your subscription, update billing information, and view
                invoices from the customer portal.
              </p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Premium Support</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Priority Updates</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="default"
            size="lg"
            className="shrink-0 shadow-sm hover:shadow transition-all duration-200"
            aria-label="Open Customer Portal"
          >
            <Link
              href={portalUrl as any}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Customer Portal
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </Alert>
  );
}
