"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AnimatedGroup } from "@workspace/ui/components/animated-group";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 0.5,
      },
    },
  },
};

export default function Hero() {
  return (
    <>
      <main className="overflow-hidden">
        <section>
          <div className="relative ">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
            <div className="mx-auto max-w-7xl px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.2,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <div className="mt-12 mb-4">
                    <a
                      href="https://www.producthunt.com/products/your-ai-co-founder-for-building-saas?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-your&#0045;ai&#0045;co&#0045;founder&#0045;for&#0045;building&#0045;saas"
                      target="_blank"
                    >
                      <img
                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1014495&theme=light&t=1757411339217"
                        alt="Your&#0032;AI&#0032;co&#0045;founder&#0032;for&#0032;building&#0032;SaaS - Build&#0032;with&#0032;confidence&#0044;&#0032;ship&#0032;SaaS&#0032;that&#0032;users&#0032;want&#0046; | Product Hunt"
                        style={{ width: "180px", height: "54px" }}
                        width="250"
                        height="54"
                      />
                    </a>
                  </div>
                  <h1 className="max-w-6xl text-balance text-5xl font-semibold md:text-5xl">
                    Your AI co-founder and product manager for{" "}
                    <span
                      className="font-bold"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--primary) 0%, #8c8c8c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        letterSpacing: "0.01em",
                      }}
                    >
                      modern SaaS.
                    </span>
                  </h1>
                  <p className="mt-8 max-w-3xl text-pretty text-lg">
                    <span className="text-orange-500 font-medium">
                      Instantly turn your SaaS idea into reality.
                    </span>{" "}
                    Validate product ideas, research, plan the product, collect
                    feedback & waitlist, launch, and iterate from user's
                    feedback.
                  </p>
                  <div className="mt-6 flex items-center gap-2">
                    <div
                      key={1}
                      className="bg-foreground/10 rounded-[14px] border p-0.5"
                    >
                      <Button asChild size="lg">
                        <Link href="https://app.rayai.dev/auth/sign-up">
                          <span className="text-nowrap">Start Building</span>
                        </Link>
                      </Button>
                    </div>
                    <Button key={2} asChild size="lg" variant="secondary">
                      <Link href="/features">
                        <span className="text-nowrap">Features</span>
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56  overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-7xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <img
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                    src="/app/dashboard-3.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <img
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                    src="/app/dashboard-3.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
