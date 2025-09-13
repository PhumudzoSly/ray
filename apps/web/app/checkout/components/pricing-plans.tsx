import { cn } from "@/lib/utils";
import { Check, Sparkles, Star, Users, Lightbulb, X } from "lucide-react";
import Subscribe from "../Subscribe";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ProductListResponse } from "dodopayments/resources/index.mjs";

interface PricingPlansProps {
  products: ProductListResponse[];
  org: string;
  email: string;
}

export function PricingPlans({ products, org, email }: PricingPlansProps) {
  // Get plan-specific features based on product name
  const getPlanFeatures = (productName: string) => {
    const name = productName.toLowerCase();

    if (
      name.includes("starter") ||
      name.includes("basic") ||
      products.length === 1
    ) {
      return {
        limits: ["Solo builders", "3 ideas"],
        core: "Full SaaS management with all unlimited features",
        support: "Email support",
        notAvailable: ["User feedback system", "CoPilot (Private beta)"],
      };
    }

    if (name.includes("pro") || name.includes("team")) {
      return {
        limits: ["Up to 5 team members", "10 ideas"],
        core: "Full SaaS management with all unlimited features",
        support: "Priority support",
        advanced: ["User feedback system", "CoPilot (Private beta)"],
      };
    }

    if (name.includes("enterprise")) {
      return {
        limits: ["Up to 50 team members", "50 ideas"],
        core: "Full SaaS management with all unlimited features",
        support: "Priority support",
        advanced: [
          "User feedback system",
          "CoPilot (Private beta)",
          "Dedicated account manager",
        ],
      };
    }

    // Default fallback
    return {
      limits: ["1 user", "5 ideas"],
      core: "Full SaaS management with all unlimited features",
      support: "Email support",
    };
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {products.map((product, index) => {
        const price = product?.price ? product.price / 100 : 0;
        const isPopular = products.length >= 2 && index === 1;
        const features = getPlanFeatures(product?.name || "");

        return (
          <div
            key={product.product_id}
            className={cn(
              "relative rounded-2xl bg-background p-8 border border-border shadow-sm transition-all duration-300 hover:shadow-lg",
              isPopular &&
                "border-primary ring-2 ring-primary/20 -translate-y-2 scale-105 z-10"
            )}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge
                  variant="default"
                  className="px-4 py-2 font-semibold shadow-lg rounded-full text-base bg-gradient-to-r from-amber-500 to-orange-500"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  {product?.name}
                </h3>
                <p className="text-muted-foreground">
                  {product?.description ||
                    `Perfect for ${product?.name?.toLowerCase()} users.`}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline mb-1">
                  <span className="text-5xl font-bold">${price}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Billed monthly
                </div>

                {/* Trial offer */}
                <div className="bg-pink-500/10 rounded-lg p-4 mb-6 border border-primary/10">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium text-primary">
                      Start your free 3-day trial
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try all features free for 3 days.
                  </p>
                </div>
              </div>

              {/* Distinct features section */}
              <div className="mb-8 flex-1">
                <ul className="space-y-4">
                  {/* Limits */}
                  <li className="flex items-start">
                    <Users className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{features.limits[0]}</span>
                      <span className="text-muted-foreground ml-1">
                        • {features.limits[1]}
                      </span>
                    </div>
                  </li>

                  {/* Core features */}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <span>{features.core}</span>
                  </li>

                  {/* Advanced features (for Pro/Enterprise) */}
                  {features.advanced && (
                    <>
                      {features.advanced.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </>
                  )}

                  {/* Not available features (for Starter) */}
                  {features.notAvailable && (
                    <>
                      {features.notAvailable.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-muted-foreground"
                        >
                          <X className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </>
                  )}

                  {/* Support */}
                  <li className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <span>{features.support}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-auto">
                <Subscribe
                  products={[product.product_id]}
                  isPopular={isPopular}
                  org={org}
                  email={email}
                />
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Cancel anytime • No hidden fees
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
