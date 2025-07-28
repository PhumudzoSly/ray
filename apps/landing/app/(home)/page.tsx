import type { Metadata } from "next";
import Features from "./features";
import Hero from "./hero";
import StatsSection from "./stats";
import FAQ from "./faq";
import Issues from "./issues";
import Roadmap from "./roadmap";

export const metadata: Metadata = {
  title:
    "Ray AI - Build Your SaaS Faster, Smarter, First | Complete SaaS Platform",
  description:
    "Turn your SaaS idea into reality with Ray AI. Validate ideas, research markets, manage products, grow waitlists, and track issues - all in one AI-powered platform. Join thousands of founders building better products faster.",
  keywords: [
    "SaaS platform",
    "SaaS validation",
    "product management",
    "issue tracking",
    "waitlist management",
    "AI-powered",
    "market research",
    "product development",
    "startup tools",
    "SaaS tools",
    "feedback management",
    "product market fit",
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
    url: "https://rayai.dev",
    siteName: "Ray AI",
    title: "Ray AI - Build Your SaaS Faster, Smarter, First",
    description:
      "Complete SaaS platform for validation, development, and growth. Validate ideas, manage products, track issues, and grow waitlists with AI-powered insights.",
    images: [
      {
        url: "/app/board.jpeg",
        width: 2700,
        height: 1440,
        alt: "Ray AI Dashboard - Complete SaaS Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ray AI - Build Your SaaS Faster, Smarter, First",
    description:
      "Complete SaaS platform for validation, development, and growth. Join thousands of founders building better products with AI-powered insights.",
    images: ["/app/board.jpeg"],
    creator: "@rayai_dev",
  },
  alternates: {
    canonical: "https://rayai.dev",
  },
  category: "Technology",
};

export default function Page() {
  return (
    <>
      <Hero />
      <Features />
      <Issues />
      <Roadmap />
      <StatsSection />
      <FAQ />
    </>
  );
}
