"use client";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function CTA() {
  const pathname = usePathname();
  if (pathname.startsWith("/wl/") || pathname.startsWith("/rm/")) return null;

  return (
    <section className="relative border-t bg-gray-50 overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Build Better SaaS Products.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join founders who've already switched to Ray AI and are building
              better products faster.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button asChild size="lg" variant="outline" className="group">
              <Link href="/pricing">
                View Pricing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" className="group">
              <Link href="https://app.rayai.dev/auth/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Start today, launch next week.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
