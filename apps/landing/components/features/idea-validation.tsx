import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import DisplayCards from "../ui/display-cards";

const validationMetrics = [
  {
    icon: Target,
    label: "Market Size",
    value: "TAM/SAM Analysis",
    color: "bg-blue-50",
  },
  {
    icon: Users,
    label: "Customer Fit",
    value: "Pain Point Mapping",
    color: "bg-green-50",
  },
  {
    icon: DollarSign,
    label: "Financial",
    value: "3-Year Projections",
    color: "bg-purple-50",
  },
  {
    icon: BarChart3,
    label: "Competition",
    value: "Landscape Analysis",
    color: "bg-orange-50",
  },
];

export default function IdeaValidationFeature() {
  return (
    <div className="relative">
      <div className="p-0 overflow-hidden ">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Validation</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    AI-Powered Idea Validation
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Validate before you build
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Get comprehensive SaaS idea validation with deep market research,
              competitor analysis, and financial projections. Our AI conducts
              analysis across 11 key dimensions to help you make informed
              decisions.
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {validationMetrics.map((metric, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg  ${metric.color} hover:shadow-md transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <metric.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {metric.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {metric.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white border-0"
                asChild
              >
                <Link href="/pricing">
                  Validate Your Idea
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                asChild
              >
                <Link href="/help">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-3 p-8 md:p-12 flex items-center justify-center">
            <div className="flex min-h-[400px] w-full items-center justify-center py-20">
              <div className="w-full max-w-3xl">
                <DisplayCards
                  cards={[
                    {
                      date: "Just now",
                      title: "Featured",
                      description: "Discover amazing content",
                    },
                    {
                      date: "Just now",
                      title: "Featured",
                    },
                    {
                      date: "Just now",
                      title: "Featured",
                      description: "Discover amazing content",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Benefits Section */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Comprehensive Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Market size analysis with TAM/SAM estimates
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Competitive landscape mapping
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Customer fit scoring with pain point analysis
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Technical feasibility assessment
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Actionable Insights
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Financial projections (3-year revenue/cost)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    User story generation
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">SWOT analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Early adopter profiles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
