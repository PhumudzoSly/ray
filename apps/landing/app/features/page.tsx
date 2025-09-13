import React from "react";
import { Metadata } from "next";
import IdeaValidation from "./idea-validation";
import ProductDev from "./product-dev";
import CustomerEngagement from "./engagement";
import { Workflow } from "./workflow";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export const metadata: Metadata = {
  title:
    "Ray AI Features - Idea Validation, Product Management, Customer Engagement",
  description:
    "Explore Ray AI's powerful features for SaaS product development, including AI-powered idea validation, streamlined product management, enhanced customer engagement, and efficient workflow automation.",
  keywords: [
    "SaaS features",
    "AI product features",
    "idea validation tool",
    "product management software",
    "customer engagement platform",
    "workflow automation",
    "market research AI",
    "product development suite",
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
    url: "https://rayai.dev/features",
    siteName: "Ray AI",
    title:
      "Ray AI Features - Idea Validation, Product Management, Customer Engagement",
    description:
      "Explore Ray AI's powerful features for SaaS product development, including AI-powered idea validation, streamlined product management, enhanced customer engagement, and efficient workflow automation.",
    images: [
      {
        url: "/app/features.png",
        width: 1200,
        height: 630,
        alt: "Ray AI Features Overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ray AI Features - Idea Validation, Product Management, Customer Engagement",
    description:
      "Explore Ray AI's powerful features for SaaS product development, including AI-powered idea validation, streamlined product management, enhanced customer engagement, and efficient workflow automation.",
    images: ["/app/features.png"],
    creator: "@rayai_dev",
  },
  alternates: {
    canonical: "https://rayai.dev/features",
  },
  category: "Technology",
};

const Features = () => {
  return (
    <>
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            All-in-One SaaS Management.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Ray AI unifies market validation, product planning & management,
            analytics and customer feedback into a single, intelligent platform,
            so you can focus on building, launching, and growing with
            confidence.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="/features/saas-validation">SaaS Validation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#idea-validation">Idea Validation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#product-dev">Product Development</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#customer-engagement">Customer Engagement</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#workflow">Workflow</Link>
            </Button>
          </div>
        </div>
      </section>

      <div id="idea-validation">
        <IdeaValidation />
      </div>
      <div id="product-dev">
        <ProductDev />
      </div>
      <div id="customer-engagement">
        <CustomerEngagement />
      </div>
      <div id="workflow">
        <Workflow />
      </div>
    </>
  );
};

export default Features;
