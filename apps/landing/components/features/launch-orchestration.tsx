import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  CheckCircle,
  Rocket,
  Calendar,
  Target,
  Users,
  Share2,
  Zap,
} from "lucide-react";
import Link from "next/link";

const LaunchTimelineSVG = () => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    {/* Background */}
    <rect
      width="800"
      height="400"
      fill="white"
      rx="8"
      stroke="#e5e7eb"
      strokeWidth="1"
    />

    {/* Timeline Line */}
    <line
      x1="100"
      y1="200"
      x2="700"
      y2="200"
      stroke="#d1d5db"
      strokeWidth="3"
    />

    {/* Phase 1 - Pre-Launch */}
    <circle
      cx="150"
      cy="200"
      r="15"
      fill="#111827"
      stroke="white"
      strokeWidth="3"
    />
    <rect
      x="100"
      y="80"
      width="100"
      height="100"
      fill="white"
      rx="6"
      stroke="#111827"
      strokeWidth="2"
    />
    <rect x="110" y="90" width="60" height="3" fill="#111827" rx="1.5" />
    <rect x="110" y="96" width="50" height="2" fill="#6b7280" rx="1" />

    {/* Pre-launch checklist */}
    <circle cx="120" cy="120" r="2" fill="#111827" />
    <rect x="130" y="118" width="50" height="2" fill="#6b7280" rx="1" />
    <circle cx="120" cy="130" r="2" fill="#111827" />
    <rect x="130" y="128" width="45" height="2" fill="#6b7280" rx="1" />
    <circle cx="120" cy="140" r="2" fill="#111827" />
    <rect x="130" y="138" width="55" height="2" fill="#6b7280" rx="1" />
    <circle cx="120" cy="150" r="2" fill="#111827" />
    <rect x="130" y="148" width="40" height="2" fill="#6b7280" rx="1" />

    {/* Phase 2 - Beta */}
    <circle
      cx="300"
      cy="200"
      r="15"
      fill="#111827"
      stroke="white"
      strokeWidth="3"
    />
    <rect
      x="250"
      y="80"
      width="100"
      height="100"
      fill="white"
      rx="6"
      stroke="#111827"
      strokeWidth="2"
    />
    <rect x="260" y="90" width="70" height="3" fill="#111827" rx="1.5" />
    <rect x="260" y="96" width="60" height="2" fill="#6b7280" rx="1" />

    {/* Beta metrics */}
    <rect x="260" y="110" width="80" height="20" fill="#f9fafb" rx="3" />
    <rect x="265" y="117" width="60" height="2" fill="#111827" rx="1" />
    <rect x="265" y="121" width="40" height="2" fill="#6b7280" rx="1" />

    <rect x="260" y="135" width="80" height="20" fill="#f9fafb" rx="3" />
    <rect x="265" y="142" width="50" height="2" fill="#111827" rx="1" />
    <rect x="265" y="146" width="30" height="2" fill="#6b7280" rx="1" />

    <rect x="260" y="160" width="80" height="20" fill="#f9fafb" rx="3" />
    <rect x="265" y="167" width="45" height="2" fill="#111827" rx="1" />
    <rect x="265" y="171" width="25" height="2" fill="#6b7280" rx="1" />

    {/* Phase 3 - Launch */}
    <circle
      cx="450"
      cy="200"
      r="15"
      fill="#111827"
      stroke="white"
      strokeWidth="3"
    />
    <rect
      x="400"
      y="80"
      width="100"
      height="100"
      fill="white"
      rx="6"
      stroke="#111827"
      strokeWidth="2"
    />
    <rect x="410" y="90" width="80" height="3" fill="#111827" rx="1.5" />
    <rect x="410" y="96" width="70" height="2" fill="#6b7280" rx="1" />

    {/* Launch metrics */}
    <rect x="410" y="110" width="80" height="15" fill="#f9fafb" rx="3" />
    <rect x="415" y="117" width="60" height="2" fill="#111827" rx="1" />

    <rect x="410" y="130" width="80" height="15" fill="#f9fafb" rx="3" />
    <rect x="415" y="137" width="50" height="2" fill="#111827" rx="1" />

    <rect x="410" y="150" width="80" height="15" fill="#f9fafb" rx="3" />
    <rect x="415" y="157" width="70" height="2" fill="#111827" rx="1" />

    {/* Phase 4 - Scale */}
    <circle
      cx="600"
      cy="200"
      r="15"
      fill="#111827"
      stroke="white"
      strokeWidth="3"
    />
    <rect
      x="550"
      y="80"
      width="100"
      height="100"
      fill="white"
      rx="6"
      stroke="#111827"
      strokeWidth="2"
    />
    <rect x="560" y="90" width="80" height="3" fill="#111827" rx="1.5" />
    <rect x="560" y="96" width="60" height="2" fill="#6b7280" rx="1" />

    {/* Scale metrics */}
    <rect x="560" y="110" width="80" height="20" fill="#f9fafb" rx="3" />
    <rect x="565" y="117" width="60" height="2" fill="#111827" rx="1" />
    <rect x="565" y="121" width="40" height="2" fill="#6b7280" rx="1" />

    <rect x="560" y="135" width="80" height="20" fill="#f9fafb" rx="3" />
    <rect x="565" y="142" width="50" height="2" fill="#111827" rx="1" />
    <rect x="565" y="146" width="30" height="2" fill="#6b7280" rx="1" />

    <rect x="560" y="160" width="80" height="20" fill="#f9fafb" rx="3" />
    <rect x="565" y="167" width="45" height="2" fill="#111827" rx="1" />
    <rect x="565" y="171" width="25" height="2" fill="#6b7280" rx="1" />

    {/* Phase Labels */}
    <text
      x="150"
      y="250"
      className="text-sm font-medium"
      fill="#111827"
      textAnchor="middle"
    >
      Pre-Launch
    </text>
    <text
      x="300"
      y="250"
      className="text-sm font-medium"
      fill="#111827"
      textAnchor="middle"
    >
      Beta
    </text>
    <text
      x="450"
      y="250"
      className="text-sm font-medium"
      fill="#111827"
      textAnchor="middle"
    >
      Launch
    </text>
    <text
      x="600"
      y="250"
      className="text-sm font-medium"
      fill="#111827"
      textAnchor="middle"
    >
      Scale
    </text>

    {/* Progress indicators */}
    <rect x="100" y="280" width="600" height="4" fill="#f3f4f6" rx="2" />
    <rect x="100" y="280" width="450" height="4" fill="#111827" rx="2" />

    {/* Status indicators */}
    <circle cx="150" cy="282" r="3" fill="#111827" />
    <circle cx="300" cy="282" r="3" fill="#111827" />
    <circle cx="450" cy="282" r="3" fill="#111827" />
    <circle cx="600" cy="282" r="3" fill="#d1d5db" />

    {/* Bottom stats */}
    <rect
      x="100"
      y="320"
      width="180"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="110" y="330" width="60" height="3" fill="#111827" rx="1.5" />
    <rect x="110" y="340" width="40" height="2" fill="#6b7280" rx="1" />
    <text
      x="190"
      y="355"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      85%
    </text>

    <rect
      x="310"
      y="320"
      width="180"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="320" y="330" width="70" height="3" fill="#111827" rx="1.5" />
    <rect x="320" y="340" width="50" height="2" fill="#6b7280" rx="1" />
    <text
      x="400"
      y="355"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      12
    </text>

    <rect
      x="520"
      y="320"
      width="180"
      height="60"
      fill="white"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="530" y="330" width="80" height="3" fill="#111827" rx="1.5" />
    <rect x="530" y="340" width="60" height="2" fill="#6b7280" rx="1" />
    <text
      x="610"
      y="355"
      className="text-2xl font-bold"
      fill="#111827"
      textAnchor="middle"
    >
      4
    </text>
  </svg>
);

const benefits = [
  "Pre-launch checklist automation",
  "Beta testing management",
  "Launch day orchestration",
  "Post-launch monitoring",
  "User feedback collection",
  "Performance tracking",
  "Marketing campaign coordination",
  "Team communication tools",
  "Success metrics dashboard",
];

export default function LaunchOrchestrationFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Launch</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <Rocket className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Launch Orchestration
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Execute flawless launches
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Orchestrate your product launch from pre-launch preparation to
              post-launch scaling. Our comprehensive tools ensure every phase is
              executed flawlessly with proper tracking and coordination.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600">Launch Phases</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">∞</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white border-0"
                asChild
              >
                <Link href="/pricing">
                  Start Launching
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
              <LaunchTimelineSVG />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-8 md:p-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Everything you need to orchestrate launches
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
