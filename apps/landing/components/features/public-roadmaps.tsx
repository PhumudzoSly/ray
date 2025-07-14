import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  CheckCircle,
  ListStart,
  Users,
  Heart,
  MessageCircle,
  TrendingUp,
  Globe,
} from "lucide-react";
import Link from "next/link";

const PublicRoadmapSVG = () => (
  <svg viewBox="0 0 700 500" className="w-full h-full">
    {/* Background */}
    <rect
      width="700"
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
      width="660"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="30" y="35" width="120" height="4" fill="#111827" rx="2" />
    <rect x="30" y="42" width="80" height="3" fill="#6b7280" rx="1.5" />
    <rect x="30" y="48" width="60" height="2" fill="#6b7280" rx="1" />

    {/* Navigation */}
    <rect x="200" y="35" width="60" height="20" fill="#111827" rx="10" />
    <rect x="270" y="35" width="60" height="20" fill="#f3f4f6" rx="10" />
    <rect x="340" y="35" width="60" height="20" fill="#f3f4f6" rx="10" />

    {/* User count */}
    <circle cx="600" cy="50" r="6" fill="#111827" />
    <rect x="615" y="46" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="615" y="51" width="40" height="2" fill="#6b7280" rx="1" />

    {/* Roadmap Items */}
    <rect
      x="30"
      y="100"
      width="640"
      height="80"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="40" y="110" width="100" height="3" fill="#111827" rx="1.5" />
    <rect x="40" y="116" width="80" height="2" fill="#6b7280" rx="1" />
    <rect x="40" y="122" width="120" height="2" fill="#6b7280" rx="1" />

    {/* Status badge */}
    <rect x="580" y="110" width="70" height="15" fill="#111827" rx="7" />
    <rect x="585" y="113" width="50" height="2" fill="white" rx="1" />
    <rect x="585" y="117" width="40" height="2" fill="white" rx="1" />

    {/* Voting and comments */}
    <rect x="40" y="140" width="40" height="12" fill="#f9fafb" rx="6" />
    <circle cx="48" cy="146" r="2" fill="#111827" />
    <rect x="54" y="144" width="20" height="2" fill="#6b7280" rx="1" />

    <rect x="90" y="140" width="40" height="12" fill="#f9fafb" rx="6" />
    <circle cx="98" cy="146" r="2" fill="#6b7280" />
    <rect x="104" y="144" width="20" height="2" fill="#6b7280" rx="1" />

    {/* Second roadmap item */}
    <rect
      x="30"
      y="200"
      width="640"
      height="80"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="40" y="210" width="90" height="3" fill="#111827" rx="1.5" />
    <rect x="40" y="216" width="70" height="2" fill="#6b7280" rx="1" />
    <rect x="40" y="222" width="110" height="2" fill="#6b7280" rx="1" />

    {/* Status badge */}
    <rect x="580" y="210" width="70" height="15" fill="#f3f4f6" rx="7" />
    <rect x="585" y="213" width="50" height="2" fill="#111827" rx="1" />
    <rect x="585" y="217" width="40" height="2" fill="#111827" rx="1" />

    {/* Voting and comments */}
    <rect x="40" y="240" width="40" height="12" fill="#f9fafb" rx="6" />
    <circle cx="48" cy="246" r="2" fill="#111827" />
    <rect x="54" y="244" width="25" height="2" fill="#6b7280" rx="1" />

    <rect x="90" y="240" width="40" height="12" fill="#f9fafb" rx="6" />
    <circle cx="98" cy="246" r="2" fill="#6b7280" />
    <rect x="104" y="244" width="15" height="2" fill="#6b7280" rx="1" />

    {/* Third roadmap item */}
    <rect
      x="30"
      y="300"
      width="640"
      height="80"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="40" y="310" width="110" height="3" fill="#111827" rx="1.5" />
    <rect x="40" y="316" width="90" height="2" fill="#6b7280" rx="1" />
    <rect x="40" y="322" width="130" height="2" fill="#6b7280" rx="1" />

    {/* Status badge */}
    <rect x="580" y="310" width="70" height="15" fill="#f3f4f6" rx="7" />
    <rect x="585" y="313" width="50" height="2" fill="#111827" rx="1" />
    <rect x="585" y="317" width="40" height="2" fill="#111827" rx="1" />

    {/* Voting and comments */}
    <rect x="40" y="340" width="40" height="12" fill="#f9fafb" rx="6" />
    <circle cx="48" cy="346" r="2" fill="#111827" />
    <rect x="54" y="344" width="30" height="2" fill="#6b7280" rx="1" />

    <rect x="90" y="340" width="40" height="12" fill="#f9fafb" rx="6" />
    <circle cx="98" cy="346" r="2" fill="#6b7280" />
    <rect x="104" y="344" width="20" height="2" fill="#6b7280" rx="1" />

    {/* Sidebar */}
    <rect
      x="20"
      y="400"
      width="200"
      height="80"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="30" y="410" width="80" height="4" fill="#111827" rx="2" />
    <rect x="30" y="420" width="60" height="3" fill="#6b7280" rx="1.5" />

    {/* Filter options */}
    <rect x="30" y="440" width="80" height="20" fill="#f9fafb" rx="10" />
    <rect x="40" y="450" width="60" height="2" fill="#111827" rx="1" />

    <rect x="30" y="470" width="80" height="20" fill="#f9fafb" rx="10" />
    <rect x="40" y="480" width="50" height="2" fill="#111827" rx="1" />

    {/* Stats panel */}
    <rect
      x="480"
      y="400"
      width="200"
      height="80"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="490" y="410" width="80" height="4" fill="#111827" rx="2" />
    <rect x="490" y="420" width="60" height="3" fill="#6b7280" rx="1.5" />

    {/* Stats */}
    <rect x="490" y="440" width="60" height="30" fill="#f9fafb" rx="4" />
    <text
      x="520"
      y="460"
      className="text-lg font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      1.2k
    </text>

    <rect x="560" y="440" width="60" height="30" fill="#f9fafb" rx="4" />
    <text
      x="590"
      y="460"
      className="text-lg font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      89
    </text>

    <rect x="630" y="440" width="40" height="30" fill="#f9fafb" rx="4" />
    <text
      x="650"
      y="460"
      className="text-lg font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      12
    </text>
  </svg>
);

const benefits = [
  "Public roadmap sharing",
  "User voting and feedback",
  "Feature request tracking",
  "Community engagement",
  "Transparent development",
  "Priority-based planning",
  "Status updates automation",
  "Integration with project management",
  "Analytics and insights",
];

export default function PublicRoadmapsFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Community</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Public Roadmaps
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Build with your community
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Share your product roadmap publicly and engage with your
              community. Collect feedback, votes, and feature requests to build
              what your users actually want.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">∞</div>
                <div className="text-sm text-gray-600">Community Members</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  Real-time
                </div>
                <div className="text-sm text-gray-600">Feedback Loop</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white border-0"
                asChild
              >
                <Link href="/pricing">
                  Start Sharing
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
            <div className="w-full max-w-2xl">
              <PublicRoadmapSVG />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-8 md:p-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Everything you need to engage your community
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
