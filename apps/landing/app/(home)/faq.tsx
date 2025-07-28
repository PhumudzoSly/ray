"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

const faqs = [
  {
    question: "How does Ray AI validate my SaaS idea?",
    answer:
      "Ray AI uses advanced AI to analyze market data, competitor landscapes, and user needs in real-time. It provides TAM/SAM/SOM calculations, competitive intelligence, and validation scorecards with actionable recommendations - all in less than an hour instead of months.",
  },
  {
    question:
      "What makes Ray AI different from other product management tools?",
    answer:
      "Unlike fragmented tools, Ray AI combines idea validation, issue tracking, public roadmaps, and waitlist management in one platform. Our AI connects insights across your entire workflow, turning roadmaps into customer acquisition tools and feedback into actionable features.",
  },
  {
    question: "How do public roadmaps help me acquire customers?",
    answer:
      "Public roadmaps with community voting create engagement and emotional investment in your product. Users vote on features they want, providing valuable feedback while becoming more likely to convert. It's a growth engine, not just a planning tool.",
  },
  {
    question: "Can I manage multiple projects with Ray AI?",
    answer:
      "Yes, Ray AI supports unlimited projects with dedicated workspaces. Each project gets its own analytics, roadmaps, and issue tracking. Perfect for founders with multiple ideas or agencies managing client projects.",
  },
  {
    question: "How quickly can I start seeing results?",
    answer:
      "Idea validation results are ready in less than an hour. You can set up your first project, create a public roadmap, and start collecting waitlist signups within the same day. AI insights begin generating as soon as you have user data.",
  },
  {
    question: "What's included in Ray AI?",
    answer:
      "Ray AI includes idea validation, issue tracking, public roadmaps with voting, waitlist management, and AI-powered insights. All features are designed to work together seamlessly, giving you a complete SaaS platform in one place.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about building better SaaS products with
            Ray AI.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-medium text-foreground pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
