"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  userId: string;
  status: string;
  priceId: string;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  cancelAtPeriodEnd: boolean;
  customerId?: string;
  amount?: number;
  currency?: string;
  interval?: string;
}

interface SubscriptionCardProps {
  subscription: Subscription | null;
  currentUserId: string;
  generateCustomerURL: () => Promise<string>;
}

export function SubscriptionCard({
  subscription,
  currentUserId,
  generateCustomerURL,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);

    try {
      const customerURL = await generateCustomerURL();
      window.open(customerURL, "_blank");
    } catch (error) {
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Active
          </Badge>
        );
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "trialing":
        return <Badge variant="secondary">Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    // Handle null or undefined dates
    if (!date) return "N/A";
    
    try {
      // Convert string dates to Date objects if needed
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if date is valid
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const formatAmount = (amount: number | null | undefined, currency: string | null | undefined) => {
    // Handle null or undefined values
    if (!amount || !currency) return "N/A";
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency?.toUpperCase() || "USD",
      }).format(amount / 100);
    } catch (error) {
      console.error("Error formatting amount:", error);
      return "Invalid Amount";
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            You don't have an active subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No active subscription found. Subscribe to access premium
              features.
            </p>
            <Button asChild>
              <a href="/checkout">Subscribe Now</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canManageSubscription = subscription.userId === currentUserId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Current Status</h3>
            <p className="text-sm text-muted-foreground">
              Your subscription is currently {subscription.status.toLowerCase()}
            </p>
          </div>
          {getStatusBadge(subscription.status)}
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscription.amount && subscription.currency && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatAmount(subscription.amount, subscription.currency)}
                  {subscription.interval && ` / ${subscription.interval}`}
                </p>
                <p className="text-xs text-muted-foreground">Billing amount</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? "Cancels on" : "Renews on"}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Period */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Current Billing Period</h4>
          <p className="text-sm text-muted-foreground">
            {formatDate(subscription.currentPeriodStart)} -{" "}
            {formatDate(subscription.currentPeriodEnd)}
          </p>
          {subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ Your subscription will be cancelled at the end of this billing
              period.
            </p>
          )}
        </div>

        {/* Management Actions */}
        {canManageSubscription && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Update payment methods, change plans, or cancel your subscription.
            </p>
          </div>
        )}

        {!canManageSubscription && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              You don't have permission to manage this subscription.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
