"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { AnimatedGroup } from "@workspace/ui/components/animated-group";
import { useScroll } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { SparklesText } from "./_components/sparkles-text";

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
        duration: 1.5,
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
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <SparklesText className="text-base font-medium mt-10 mb-2 bg-orange-500/10 px-8 max-w-fit py-1">
                    Just Launched
                  </SparklesText>
                  <h1 className="max-w-3xl text-balance text-5xl font-medium md:text-6xl">
                    Build your SaaS.{" "}
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
                      Faster. Smarter. First.
                    </span>
                  </h1>
                  <p className="mt-8 max-w-3xl text-pretty text-lg">
                    Instantly turn your SaaS idea into reality. Validate the
                    idea, research, plan the product, grow your waitlist, and
                    launch, and iterate from user's feedback. <br /> <br />{" "}
                    <span className="text-orange-500 font-bold">
                      All in one place.
                    </span>{" "}
                    <span className="font-semibold">
                      Join RayAI and get ahead of the crowd.
                    </span>
                  </p>
                  <div className="mt-12 flex items-center gap-2">
                    <div
                      key={1}
                      className="bg-foreground/10 rounded-[14px] border p-0.5"
                    >
                      <Button asChild size="lg">
                        <Link href="https://rayai.dev/auth/sign-up">
                          <span className="text-nowrap">Start Building</span>
                        </Link>
                      </Button>
                    </div>
                    <Button key={2} asChild size="lg" variant="secondary">
                      <Link href="/product">
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
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-7xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <img
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                    src="/app/dashboard-2.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <img
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                    src="/app/dashboard-2.png"
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
