import { cn } from "@/lib/utils";
import type { Product } from "@polar-sh/sdk/models/components/product.js";
import { Check, Sparkles } from "lucide-react";
import Subscribe from "../Subscribe";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

interface PricingPlansProps {
  products: Product[];
  org: string;
  email: string;
}

function getPrice(product: Product): string {
  const firstPrice = product.prices[0];
  return firstPrice?.amountType === "fixed"
    ? `$${firstPrice.priceAmount / 100}`
    : firstPrice?.amountType === "free"
      ? "Free"
      : "Pay what you want";
}

export function PricingPlans({ products, org, email }: PricingPlansProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {products.map((product, index) => {
        const price = getPrice(product);
        const isPopular = products.length >= 2 && index === 1;

        return (
          <div
            key={product.id}
            className={cn(
              "relative rounded-2xl bg-background p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-md",
              isPopular && "border-primary ring-1 ring-primary/20"
            )}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge
                  variant="default"
                  className="px-3 py-1 font-medium shadow-sm rounded-full"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Popular
                </Badge>
              </div>
            )}

            <div className="flex flex-col h-full pt-4">
              <div className="mb-6">
                <h3 className="text-xl font-semibold tracking-tight mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {product.description ||
                    `Perfect for ${product.name.toLowerCase()} users who need essential features.`}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">{price}</span>
                  {product.prices[0]?.amountType === "fixed" && (
                    <span className="text-muted-foreground text-sm ml-1.5">
                      /month
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {product.benefits.map((value) => {
                    return (
                      <div
                        key={value.description}
                        className="flex items-start text-muted-foreground text-sm"
                      >
                        <Check className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{value.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto">
                <Subscribe
                  products={[product.id]}
                  isPopular={isPopular}
                  org={org}
                  email={email}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
