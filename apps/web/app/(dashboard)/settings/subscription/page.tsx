import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getSubscription,
  generateCustomerPortalURL,
} from "@/actions/account/subscription";
import { SubscriptionCard } from "./_components/subscription-card";

export default async function BillingSubscriptionPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((h) => h.headers()),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const subscription = await getSubscription();

  return (
    <div className="container mx-auto py-6 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, billing information, and payment methods.
        </p>
      </div>

      <div className="mt-6">
        <SubscriptionCard
          subscription={subscription}
          currentUserId={session.user.id}
          generateCustomerURL={generateCustomerPortalURL}
        />
      </div>
    </div>
  );
}
