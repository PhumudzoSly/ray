import { cn } from "@/lib/utils";
import type { Product } from "@polar-sh/sdk/models/components/product.js";
import { Sparkles } from "lucide-react";
import Subscribe from "../Subscribe";
import { Badge } from "@workspace/ui/components/badge";

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
              "relative rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden",
              isPopular && "ring-2 ring-primary"
            )}
          >
            {isPopular && (
              <div className="absolute top-4 right-4 z-10">
                <Badge
                  variant="default"
                  className="px-3 py-1 font-medium shadow-sm"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Popular
                </Badge>
              </div>
            )}

            <div className="p-8 flex flex-col h-full">
              <div className="mb-auto">
                <h3 className="text-xl font-semibold tracking-tight mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {product.description ||
                    `Perfect for ${product.name.toLowerCase()} users who need essential features.`}
                </p>
              </div>

              <div className="mt-auto">
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">{price}</span>
                  {product.prices[0]?.amountType === "fixed" && (
                    <span className="text-muted-foreground text-sm ml-1.5">
                      /month
                    </span>
                  )}
                </div>

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
