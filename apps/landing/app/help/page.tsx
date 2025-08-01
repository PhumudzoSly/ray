import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Ray AI Help Center - Get Support for Your SaaS Platform",
  description:
    "Find answers to your questions and get support for Ray AI. Contact our team for assistance with idea validation, product management, issue tracking, and more.",
  keywords: [
    "Ray AI support",
    "help center",
    "SaaS platform help",
    "product management support",
    "issue tracking help",
    "contact support",
    "customer service",
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
    url: "https://rayai.dev/help",
    siteName: "Ray AI",
    title: "Ray AI Help Center - Get Support for Your SaaS Platform",
    description:
      "Find answers to your questions and get support for Ray AI. Contact our team for assistance with idea validation, product management, issue tracking, and more.",
    images: [
      {
        url: "https://rayai.dev/og-image.jpg", // Replace with an actual image for your help page
        width: 1200,
        height: 630,
        alt: "Ray AI Help Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ray AI Help Center - Get Support for Your SaaS Platform",
    description:
      "Find answers to your questions and get support for Ray AI. Contact our team for assistance with idea validation, product management, issue tracking, and more.",
    images: ["https://rayai.dev/twitter-image.jpg"], // Replace with an actual image for your help page
    creator: "@rayai_dev",
  },
  alternates: {
    canonical: "https://rayai.dev/help",
  },
  category: "Support",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Badge variant="outline" className="mb-4">
            Help & Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Contact our support team using the form below. We’ll get back to you
            as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-xl mx-auto px-4 py-16">
        <Card className="p-8">
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
