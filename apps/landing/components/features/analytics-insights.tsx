import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
  Brain,
  Zap,
} from "lucide-react";
import Link from "next/link";

const AnalyticsDashboardSVG = () => (
  <svg viewBox="0 0 800 500" className="w-full h-full">
    {/* Background */}
    <rect
      width="800"
      height="500"
      fill="white"
      rx="8"
      stroke="#e5e7eb"
      strokeWidth="1"
    />

    {/* Header */}
    <rect
      x="20"
      y="20"
      width="760"
      height="50"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="30" y="30" width="120" height="4" fill="#111827" rx="2" />
    <rect x="30" y="37" width="80" height="3" fill="#6b7280" rx="1.5" />
    <rect x="30" y="43" width="60" height="2" fill="#6b7280" rx="1" />

    {/* Time selector */}
    <rect x="650" y="30" width="60" height="20" fill="#111827" rx="10" />
    <rect x="720" y="30" width="50" height="20" fill="#f3f4f6" rx="10" />

    {/* KPI Cards */}
    <rect
      x="20"
      y="90"
      width="180"
      height="100"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="30" y="100" width="80" height="3" fill="#111827" rx="1.5" />
    <rect x="30" y="106" width="60" height="2" fill="#6b7280" rx="1" />
    <rect x="30" y="150" width="60" height="8" fill="#111827" rx="4" />
    <rect x="30" y="170" width="40" height="3" fill="#6b7280" rx="1.5" />

    <rect
      x="220"
      y="90"
      width="180"
      height="100"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="230" y="100" width="70" height="3" fill="#111827" rx="1.5" />
    <rect x="230" y="106" width="50" height="2" fill="#6b7280" rx="1" />
    <rect x="230" y="150" width="50" height="8" fill="#111827" rx="4" />
    <rect x="230" y="170" width="30" height="3" fill="#6b7280" rx="1.5" />

    <rect
      x="420"
      y="90"
      width="180"
      height="100"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="430" y="100" width="60" height="3" fill="#111827" rx="1.5" />
    <rect x="430" y="106" width="40" height="2" fill="#6b7280" rx="1" />
    <rect x="430" y="150" width="40" height="8" fill="#111827" rx="4" />
    <rect x="430" y="170" width="25" height="3" fill="#6b7280" rx="1.5" />

    <rect
      x="620"
      y="90"
      width="160"
      height="100"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="630" y="100" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="630" y="106" width="30" height="2" fill="#6b7280" rx="1" />
    <rect x="630" y="150" width="30" height="8" fill="#111827" rx="4" />
    <rect x="630" y="170" width="20" height="3" fill="#6b7280" rx="1.5" />

    {/* Main Chart */}
    <rect
      x="20"
      y="210"
      width="380"
      height="200"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="30" y="220" width="100" height="4" fill="#111827" rx="2" />
    <rect x="30" y="230" width="80" height="3" fill="#6b7280" rx="1.5" />

    {/* Chart lines */}
    <polyline
      points="40,350 80,320 120,300 160,280 200,260 240,240 280,220 320,200 360,180"
      fill="none"
      stroke="#111827"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <polyline
      points="40,360 80,340 120,320 160,300 200,280 240,260 280,240 320,220 360,200"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Chart grid */}
    <line x1="40" y1="200" x2="360" y2="200" stroke="#f3f4f6" strokeWidth="1" />
    <line x1="40" y1="240" x2="360" y2="240" stroke="#f3f4f6" strokeWidth="1" />
    <line x1="40" y1="280" x2="360" y2="280" stroke="#f3f4f6" strokeWidth="1" />
    <line x1="40" y1="320" x2="360" y2="320" stroke="#f3f4f6" strokeWidth="1" />
    <line x1="40" y1="360" x2="360" y2="360" stroke="#f3f4f6" strokeWidth="1" />

    {/* Insights Panel */}
    <rect
      x="420"
      y="210"
      width="360"
      height="200"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="430" y="220" width="80" height="4" fill="#111827" rx="2" />
    <rect x="430" y="230" width="60" height="3" fill="#6b7280" rx="1.5" />

    {/* Insight items */}
    <rect x="430" y="250" width="340" height="30" fill="#f9fafb" rx="4" />
    <circle cx="440" cy="265" r="3" fill="#111827" />
    <rect x="450" y="263" width="200" height="2" fill="#111827" rx="1" />
    <rect x="450" y="267" width="150" height="2" fill="#6b7280" rx="1" />

    <rect x="430" y="290" width="340" height="30" fill="#f9fafb" rx="4" />
    <circle cx="440" cy="305" r="3" fill="#111827" />
    <rect x="450" y="303" width="180" height="2" fill="#111827" rx="1" />
    <rect x="450" y="307" width="120" height="2" fill="#6b7280" rx="1" />

    <rect x="430" y="330" width="340" height="30" fill="#f9fafb" rx="4" />
    <circle cx="440" cy="345" r="3" fill="#111827" />
    <rect x="450" y="343" width="160" height="2" fill="#111827" rx="1" />
    <rect x="450" y="347" width="100" height="2" fill="#6b7280" rx="1" />

    <rect x="430" y="370" width="340" height="30" fill="#f9fafb" rx="4" />
    <circle cx="440" cy="385" r="3" fill="#111827" />
    <rect x="450" y="383" width="140" height="2" fill="#111827" rx="1" />
    <rect x="450" y="387" width="80" height="2" fill="#6b7280" rx="1" />

    {/* Bottom stats */}
    <rect
      x="20"
      y="430"
      width="180"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="30" y="440" width="60" height="3" fill="#111827" rx="1.5" />
    <rect x="30" y="450" width="40" height="2" fill="#6b7280" rx="1" />
    <text
      x="110"
      y="465"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      24.5%
    </text>

    <rect
      x="220"
      y="430"
      width="180"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="230" y="440" width="70" height="3" fill="#111827" rx="1.5" />
    <rect x="230" y="450" width="50" height="2" fill="#6b7280" rx="1" />
    <text
      x="310"
      y="465"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      1.2k
    </text>

    <rect
      x="420"
      y="430"
      width="180"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="430" y="440" width="60" height="3" fill="#111827" rx="1.5" />
    <rect x="430" y="450" width="40" height="2" fill="#6b7280" rx="1" />
    <text
      x="510"
      y="465"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      89%
    </text>

    <rect
      x="620"
      y="430"
      width="160"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="630" y="440" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="630" y="450" width="30" height="2" fill="#6b7280" rx="1" />
    <text
      x="700"
      y="465"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      12
    </text>
  </svg>
);

const benefits = [
  "Real-time performance tracking",
  "AI-powered insights generation",
  "Custom metric dashboards",
  "Automated alerting system",
  "Data visualization tools",
  "Trend analysis and forecasting",
  "Team performance metrics",
  "Integration with external tools",
  "Export and reporting features",
];

export default function AnalyticsInsightsFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Analytics</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Analytics & Insights
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Data-driven decisions
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Get deep insights into your product performance with comprehensive
              analytics. Track key metrics, identify trends, and make
              data-driven decisions to optimize your SaaS.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  Real-time
                </div>
                <div className="text-sm text-gray-600">Data Updates</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">AI</div>
                <div className="text-sm text-gray-600">Powered Insights</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white border-0"
                asChild
              >
                <Link href="/pricing">
                  View Analytics
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
            <div className="w-full max-w-3xl">
              <AnalyticsDashboardSVG />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-8 md:p-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Everything you need for data-driven decisions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
