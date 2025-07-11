"use client";

import { useEffect, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Star,
  CheckCircle,
  Activity,
  Clock,
  MessageSquare,
  User,
} from "lucide-react";

export default function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const statElements = document.querySelectorAll(".stat-number");
    statElements.forEach((el) => observer.observe(el));

    return () => {
      statElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 space-y-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold ">
                The goal is to launch SaaS that solves real problems.
              </h2>
            </div>
            <p className="text-lg">
              Founders are launching startups everyday, some good, some bad,
              some terrible{" "}
              <span className="text-muted-foreground">
                - Idea validation & feedback are very important to ensure your
                SaaS solves a real world problem and users are willing to pay
                for it.
              </span>
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="flex items-start gap-4 mb-12 group">
                <CheckCircle className="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0 transition-transform group-hover:scale-110" />
                <p className="text-zinc-400 text-lg">
                  Ray AI solves majority of problems founders face during SaaS
                  validation and development, giving you real data and feedback
                  in real time to build and launch a scalable business.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="group">
                  <div className="flex items-center mb-4">
                    <Activity className="w-5 h-5 text-violet-500 mr-2 transition-transform group-hover:scale-110" />
                    <h3 className="text-base font-medium text-zinc-100">
                      Growth
                    </h3>
                  </div>
                  <div className="stat-number text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-violet-300 opacity-0 transform translate-y-4 transition-all duration-1000">
                    +30M
                  </div>
                  <p className="text-lg mt-2 font-medium text-zinc-500">
                    Developers coding globally
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center mb-4">
                    <Clock className="w-5 h-5 text-blue-500 mr-2 transition-transform group-hover:scale-110" />
                    <h3 className="text-base font-medium text-zinc-100">
                      Efficiency
                    </h3>
                  </div>
                  <div className="stat-number text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300 opacity-0 transform translate-y-4 transition-all duration-1000">
                    +500h
                  </div>
                  <p className="text-lg mt-2 font-medium text-zinc-500">
                    Saved on validation
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="p-8 rounded-2xl border border-zinc-200 shadow-[0_0_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_0_1px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.05)] transition-shadow bg-gradient-to-b from-white to-zinc-50/50">
                <div className="flex items-start mb-6">
                  <MessageSquare className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <h3 className="text-lg font-medium text-zinc-900">
                    Founder Testimonial
                  </h3>
                </div>

                <blockquote className="relative">
                  <p className="text-zinc-600 text-lg italic leading-relaxed">
                    "I have been building SaaS that keeps on failing over and
                    over again, until I realized I was building something that
                    no one wants, and kept getting stuck on building million
                    features instead of focusing on the real problem."
                  </p>

                  <div className="mt-8 flex items-center">
                    <div className="ml-4">
                      <cite className="text-zinc-900 font-medium block not-italic">
                        Phumudzo, Founder
                      </cite>
                      <Button
                        className="mt-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                        size="sm"
                        asChild
                      >
                        <a
                          href="https://x.com/phumudzooooo"
                          className="inline-flex items-center"
                        >
                          Follow on X
                        </a>
                      </Button>
                    </div>
                  </div>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
