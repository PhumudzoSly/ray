import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  Layers,
  Calendar,
  Users,
  GitBranch,
  Target,
  BarChart3,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const ProjectTimelineSVG = () => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    {/* Background */}
    <rect
      width="800"
      height="400"
      fill="white"
      rx="12"
      stroke="#e5e7eb"
      strokeWidth="1"
    />

    {/* Main Timeline */}
    <line
      x1="100"
      y1="200"
      x2="700"
      y2="200"
      stroke="#e5e7eb"
      strokeWidth="2"
    />

    {/* Timeline Nodes */}
    <circle cx="150" cy="200" r="8" fill="#111827" />
    <circle cx="300" cy="200" r="8" fill="#111827" />
    <circle cx="450" cy="200" r="8" fill="#111827" />
    <circle cx="600" cy="200" r="8" fill="#111827" />
    <circle cx="750" cy="200" r="8" fill="#111827" />

    {/* Progress Animation */}
    <line
      x1="100"
      y1="200"
      x2="450"
      y2="200"
      stroke="#111827"
      strokeWidth="3"
      strokeDasharray="5,5"
    >
      <animate
        attributeName="stroke-dashoffset"
        values="0;-10"
        dur="2s"
        repeatCount="indefinite"
      />
    </line>

    {/* Project Cards */}
    <rect
      x="120"
      y="80"
      width="60"
      height="40"
      fill="#f9fafb"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="125" y="85" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="125" y="90" width="40" height="2" fill="#6b7280" rx="1" />
    <rect x="125" y="95" width="30" height="2" fill="#6b7280" rx="1" />

    <rect
      x="270"
      y="120"
      width="60"
      height="40"
      fill="#f9fafb"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="275" y="125" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="275" y="130" width="40" height="2" fill="#6b7280" rx="1" />
    <rect x="275" y="135" width="35" height="2" fill="#6b7280" rx="1" />

    <rect
      x="420"
      y="100"
      width="60"
      height="40"
      fill="#f9fafb"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="425" y="105" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="425" y="110" width="45" height="2" fill="#6b7280" rx="1" />
    <rect x="425" y="115" width="25" height="2" fill="#6b7280" rx="1" />

    <rect
      x="570"
      y="140"
      width="60"
      height="40"
      fill="#f9fafb"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="575" y="145" width="50" height="3" fill="#111827" rx="1.5" />
    <rect x="575" y="150" width="40" height="2" fill="#6b7280" rx="1" />
    <rect x="575" y="155" width="35" height="2" fill="#6b7280" rx="1" />

    {/* Team Activity */}
    <circle cx="200" cy="280" r="4" fill="#111827" />
    <circle cx="220" cy="280" r="4" fill="#111827" />
    <circle cx="240" cy="280" r="4" fill="#111827" />
    <rect x="180" y="290" width="80" height="2" fill="#6b7280" rx="1" />

    <circle cx="350" cy="280" r="4" fill="#111827" />
    <circle cx="370" cy="280" r="4" fill="#111827" />
    <rect x="330" y="290" width="60" height="2" fill="#6b7280" rx="1" />

    <circle cx="500" cy="280" r="4" fill="#111827" />
    <circle cx="520" cy="280" r="4" fill="#111827" />
    <circle cx="540" cy="280" r="4" fill="#111827" />
    <rect x="480" y="290" width="80" height="2" fill="#6b7280" rx="1" />

    {/* Metrics Dashboard */}
    <rect
      x="650"
      y="80"
      width="120"
      height="80"
      fill="#f9fafb"
      rx="8"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="660" y="90" width="100" height="3" fill="#111827" rx="1.5" />

    {/* Progress Bars */}
    <rect x="660" y="110" width="100" height="4" fill="#e5e7eb" rx="2" />
    <rect x="660" y="110" width="75" height="4" fill="#111827" rx="2" />

    <rect x="660" y="120" width="100" height="4" fill="#e5e7eb" rx="2" />
    <rect x="660" y="120" width="60" height="4" fill="#111827" rx="2" />

    <rect x="660" y="130" width="100" height="4" fill="#e5e7eb" rx="2" />
    <rect x="660" y="130" width="90" height="4" fill="#111827" rx="2" />

    {/* Floating Elements */}
    <circle cx="180" cy="60" r="3" fill="#111827" opacity="0.6">
      <animate
        attributeName="cy"
        values="60;50;60"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="400" cy="70" r="2" fill="#111827" opacity="0.4">
      <animate
        attributeName="cy"
        values="70;60;70"
        dur="4s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="620" cy="65" r="2.5" fill="#111827" opacity="0.5">
      <animate
        attributeName="cy"
        values="65;55;65"
        dur="3.5s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const projectStats = [
  {
    icon: Clock,
    value: "12",
    label: "Active Projects",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    value: "8",
    label: "Team Members",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: TrendingUp,
    value: "94%",
    label: "On Track",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Target,
    value: "23",
    label: "Milestones",
    color: "bg-orange-50 text-orange-600",
  },
];

const keyFeatures = [
  "Visual timeline tracking with real-time progress",
  "Team collaboration with role-based permissions",
  "Automated milestone notifications and reminders",
  "Resource allocation and capacity planning",
  "Integration with Git workflows and CI/CD",
  "Custom dashboard with project analytics",
];

export default function ProjectManagementFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Management</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Project Management
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Visual timeline tracking
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Transform your project workflow with our visual timeline system.
              Track progress in real-time, manage team collaboration, and ensure
              every milestone is met with precision and clarity.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {projectStats.map((stat, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${stat.color} border border-current/20`}
                >
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-5 h-5" />
                    <div>
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-xs opacity-80">{stat.label}</div>
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
                  Start Managing
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
              <ProjectTimelineSVG />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 md:p-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Powerful project management capabilities
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {keyFeatures.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
