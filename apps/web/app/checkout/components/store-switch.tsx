import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

export function StoreSwitch() {
  return (
    <Button
      asChild
      variant="dark"
      size="lg"
      className="w-full sm:w-auto"
      aria-label="Switch Store or Organisation"
    >
      <Link href="/switch-store" className="flex items-center gap-3">
        <Store className="h-5 w-5" aria-hidden="true" />
        <div className="text-left">
          <div className="font-medium">Switch Organization</div>
          <div className="text-xs">
            Change to a different store or organization
          </div>
        </div>
      </Link>
    </Button>
  );
}
