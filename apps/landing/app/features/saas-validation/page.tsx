import React from "react";
import { Metadata } from "next";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ValidationSection } from "./validation-section";
import {
  Activity,
  Brain,
  TrendingUp,
  Target,
  Shield,
  BarChart3,
  Lightbulb,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS Idea Validation - Ray AI",
  description:
    "Validate your SaaS ideas with AI-powered market research, competitor analysis, and product-market fit assessment before building.",
  keywords: [
    "SaaS validation",
    "idea validation",
    "market research",
    "product-market fit",
    "startup validation",
    "AI validation tool",
  ],
  authors: [{ name: "Ray AI" }],
  creator: "Ray AI",
  publisher: "Ray AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rayai.dev/features/saas-validation",
    siteName: "Ray AI",
    title: "SaaS Idea Validation - Ray AI",
    description:
      "Validate your SaaS ideas with AI-powered market research, competitor analysis, and product-market fit assessment before building.",
    images: [
      {
        url: "/app/features/saas-validation.png",
        width: 1200,
        height: 630,
        alt: "SaaS Idea Validation with Ray AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Idea Validation - Ray AI",
    description:
      "Validate your SaaS ideas with AI-powered market research, competitor analysis, and product-market fit assessment before building.",
    images: ["/app/features/saas-validation.png"],
    creator: "@rayai_dev",
  },
  alternates: {
    canonical: "https://rayai.dev/features/saas-validation",
  },
  category: "Technology",
};

export default function SaasValidationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            <Lightbulb className="h-4 w-4" />
            Idea Validation
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Validate Your SaaS Ideas
            <span className="text-primary"> Before Building</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Stop guessing what your customers want. Get AI-powered insights to
            validate your SaaS ideas with real market data, competitor analysis,
            and product-market fit assessment.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="https://app.rayai.dev/auth/sign-up">
                Start Validating
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-primary">92%</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Reduction in failed product launches
              </div>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-primary">4.2x</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Faster time to market validation
              </div>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-primary">87/100</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Average validation confidence score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How SaaS Validation Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our AI-powered validation process gives you comprehensive insights
              into your idea's potential success.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">AI Market Analysis</h3>
              <p className="mt-2 text-muted-foreground">
                Get instant insights into market size, trends, and opportunities
                for your SaaS idea.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">
                Competitor Intelligence
              </h3>
              <p className="mt-2 text-muted-foreground">
                Analyze competitors, identify gaps, and find your unique
                positioning in the market.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">
                Audience Validation
              </h3>
              <p className="mt-2 text-muted-foreground">
                Understand your target audience's needs, pain points, and
                willingness to pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Validation Process Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Validation Process
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our comprehensive validation process gives you the confidence to
              move forward with your idea.
            </p>
          </div>

          <ValidationSection />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Validate Your SaaS Ideas?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Don't waste time and resources building products that nobody
              wants.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col rounded-lg border p-6">
              <CheckCircle className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">Reduce Risk</h3>
              <p className="mt-2 text-muted-foreground">
                Identify potential problems early and avoid costly mistakes in
                development.
              </p>
            </div>

            <div className="flex flex-col rounded-lg border p-6">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">Save Time</h3>
              <p className="mt-2 text-muted-foreground">
                Get clarity on your idea's potential in hours instead of months.
              </p>
            </div>

            <div className="flex flex-col rounded-lg border p-6">
              <Target className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">
                Find Product-Market Fit
              </h3>
              <p className="mt-2 text-muted-foreground">
                Understand what your customers actually want before you build
                it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-gradient-to-r from-primary/10 to-primary/5 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Validate Your SaaS Idea?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of entrepreneurs who validate their ideas with Ray
            AI.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="https://app.rayai.dev/auth/sign-up">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">
                View All Features <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
