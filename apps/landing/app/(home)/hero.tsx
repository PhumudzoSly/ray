"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AnimatedGroup } from "@workspace/ui/components/animated-group";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { PlayIcon } from "lucide-react";

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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

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
                  <div className="mt-12">
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
                  <h1 className="max-w-6xl mt-12 text-balance text-5xl font-semibold md:text-5xl">
                    Build, validate, and launch SaaS products with{" "}
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
                      AI-powered confidence.
                    </span>
                  </h1>
                  <p className="mt-8 max-w-3xl text-pretty text-lg">
                    <span className="text-orange-500 font-medium">
                      Transform your SaaS idea into a successful business.
                    </span>{" "}
                    Validate market demand, research competitors, plan your
                    product, collect feedback & waitlist, manage your roadmap,
                    and launch with precision - all powered by AI.
                  </p>
                  <div className="mt-6 flex items-center gap-2">
                    <div
                      key={1}
                      className="bg-foreground/10 rounded-[14px] border p-0.5"
                    >
                      <Button asChild size="lg">
                        <Link
                          target="_blank"
                          className="flex items-center gap-2"
                          href="https://app.arcade.software/share/y5weeFpG3hJ7A0VfZWXe"
                        >
                          <PlayIcon />{" "}
                          <span className="text-nowrap">See how it works</span>
                        </Link>
                      </Button>
                    </div>
                    <Button key={2} asChild size="lg" variant="secondary">
                      <Link href="/features">
                        <span className="text-nowrap">Explore features</span>
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
                  {/* Play button overlay */}
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group"
                    onClick={openVideoModal}
                  >
                    <div className="bg-primary/90 rounded-full p-4 group-hover:bg-primary transition-all duration-300 transform group-hover:scale-110">
                      <PlayIcon className="w-12 h-12 text-white ml-1" />
                    </div>
                  </div>

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

      {/* YouTube Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-lg">
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/9wvWzBH0kp0"
              title="RayAI - Your AI Co-founder & Product Manager"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
