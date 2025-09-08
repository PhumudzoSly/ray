import { StoreSwitch } from "./components/store-switch";
import { SubscriptionAlert } from "./components/subscription-alert";
import { PricingPlans } from "./components/pricing-plans";
import { getSession } from "@/actions/account/user";
import { polarClient } from "@/lib/auth";
import { generateCustomerURL } from "@/actions/account/subscription";

export default async function Page() {
  const { org, email } = await getSession();
  const [{ result }, portalUrl] = await Promise.all([
    polarClient.products.list({ isArchived: false }),
    generateCustomerURL(),
  ]);

  const sortedProducts = [...result.items].sort((a, b) => {
    // @ts-ignore
    const priceA = a.prices[0]?.priceAmount || 0;
    // @ts-ignore
    const priceB = b.prices[0]?.priceAmount || 0;
    return priceA - priceB;
  });

  return (
    <main className="min-h-screen bg-background py-20">
      <div className="container max-w-6xl px-4">
        <div className="space-y-4 flex flex-col items-center justify-center mb-16">
          <StoreSwitch />
          {portalUrl ? <SubscriptionAlert portalUrl={portalUrl} /> : null}
        </div>

        <div className="space-y-4 mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Join RayAI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>

        <PricingPlans products={sortedProducts} org={org} email={email} />
      </div>
      <br />
      <div className="container mt-4 px-4">
        <div className="space-y-4 mb-16 text-center">
          <h1 className="text-xl font-bold tracking-tight">
            Need full pricing?
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Visit{" "}
            <a
              className="underline text-blue-500"
              target="_blank"
              href="https://rayai.dev/pricing"
            >
              our pricing page
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
