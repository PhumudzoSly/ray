"use client";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";
import { subscribeToProduct } from "@/actions/account/subscription";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const Subscribe = ({
  isPopular,
  products,
  org,
  email,
}: {
  isPopular?: boolean;
  products: string[];
  org: string;
  email: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      await subscribeToProduct({
        products,
        email,
        org,
        successUrl: `${window.location.origin}/dashboard`,
      });
    } catch (error) {
      toast.error("Failed to create checkout session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={cn("w-full transition-all duration-200")}
      variant={isPopular ? "dark" : "default"}
      onClick={handleSubscribe}
      tabIndex={0}
      aria-label="Subscribe and checkout"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          Processing...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          Start For Free
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </Button>
  );
};

export default Subscribe;
