import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  Grid2X2,
  Zap,
  GitBranch,
  Code,
  Database,
  Shield,
  Play,
  Settings,
  Palette,
} from "lucide-react";
import Link from "next/link";

const AnimatedFlowBuilderSVG = () => (
  <svg viewBox="0 0 800 500" className="w-full h-full">
    {/* Clean background */}
    <rect
      width="800"
      height="500"
      fill="white"
      rx="12"
      stroke="#f3f4f6"
      strokeWidth="1"
    />

    {/* Main canvas area */}
    <rect
      x="40"
      y="40"
      width="720"
      height="420"
      fill="white"
      rx="8"
      stroke="#e5e7eb"
      strokeWidth="1"
      className="shadow-sm"
    />

    {/* Toolbar */}
    <rect
      x="60"
      y="60"
      width="680"
      height="40"
      fill="#f9fafb"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="75" y="70" width="24" height="24" fill="#111827" rx="4" />
    <rect x="110" y="70" width="24" height="24" fill="#111827" rx="4" />
    <rect x="145" y="70" width="24" height="24" fill="#111827" rx="4" />
    <rect x="180" y="70" width="24" height="24" fill="#111827" rx="4" />

    {/* Flow nodes with better design */}
    <g>
      <rect
        x="80"
        y="140"
        width="140"
        height="80"
        fill="white"
        rx="8"
        stroke="#3b82f6"
        strokeWidth="2"
        className="shadow-md"
      />
      <rect x="95" y="155" width="24" height="24" fill="#dbeafe" rx="4" />
      <rect x="130" y="160" width="80" height="4" fill="#111827" rx="2" />
      <rect x="130" y="168" width="60" height="3" fill="#6b7280" rx="1.5" />
      <text
        x="150"
        y="195"
        textAnchor="middle"
        className="text-xs font-medium"
        fill="#3b82f6"
      >
        Auth Node
      </text>
    </g>

    <g>
      <rect
        x="280"
        y="140"
        width="140"
        height="80"
        fill="white"
        rx="8"
        stroke="#10b981"
        strokeWidth="2"
        className="shadow-md"
      />
      <rect x="295" y="155" width="24" height="24" fill="#d1fae5" rx="4" />
      <rect x="330" y="160" width="80" height="4" fill="#111827" rx="2" />
      <rect x="330" y="168" width="60" height="3" fill="#6b7280" rx="1.5" />
      <text
        x="350"
        y="195"
        textAnchor="middle"
        className="text-xs font-medium"
        fill="#10b981"
      >
        API Node
      </text>
    </g>

    <g>
      <rect
        x="480"
        y="140"
        width="140"
        height="80"
        fill="white"
        rx="8"
        stroke="#f59e0b"
        strokeWidth="2"
        className="shadow-md"
      />
      <rect x="495" y="155" width="24" height="24" fill="#fef3c7" rx="4" />
      <rect x="530" y="160" width="80" height="4" fill="#111827" rx="2" />
      <rect x="530" y="168" width="60" height="3" fill="#6b7280" rx="1.5" />
      <text
        x="550"
        y="195"
        textAnchor="middle"
        className="text-xs font-medium"
        fill="#f59e0b"
      >
        DB Node
      </text>
    </g>

    {/* Clean connection lines */}
    <g>
      <path
        d="M220 180 L280 180"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeDasharray="4,4"
      />
      <circle cx="220" cy="180" r="4" fill="#3b82f6" />
      <circle cx="280" cy="180" r="4" fill="#10b981" />
    </g>

    <g>
      <path
        d="M420 180 L480 180"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeDasharray="4,4"
      />
      <circle cx="420" cy="180" r="4" fill="#10b981" />
      <circle cx="480" cy="180" r="4" fill="#f59e0b" />
    </g>

    {/* Bottom row - different node types */}
    <g>
      <rect
        x="80"
        y="280"
        width="140"
        height="80"
        fill="white"
        rx="8"
        stroke="#8b5cf6"
        strokeWidth="2"
        className="shadow-md"
      />
      <rect x="95" y="295" width="24" height="24" fill="#ede9fe" rx="4" />
      <rect x="130" y="300" width="80" height="4" fill="#111827" rx="2" />
      <rect x="130" y="308" width="60" height="3" fill="#6b7280" rx="1.5" />
      <text
        x="150"
        y="335"
        textAnchor="middle"
        className="text-xs font-medium"
        fill="#8b5cf6"
      >
        Logic Node
      </text>
    </g>

    <g>
      <rect
        x="280"
        y="280"
        width="140"
        height="80"
        fill="white"
        rx="8"
        stroke="#ec4899"
        strokeWidth="2"
        className="shadow-md"
      />
      <rect x="295" y="295" width="24" height="24" fill="#fce7f3" rx="4" />
      <rect x="330" y="300" width="80" height="4" fill="#111827" rx="2" />
      <rect x="330" y="308" width="60" height="3" fill="#6b7280" rx="1.5" />
      <text
        x="350"
        y="335"
        textAnchor="middle"
        className="text-xs font-medium"
        fill="#ec4899"
      >
        UI Node
      </text>
    </g>

    <g>
      <rect
        x="480"
        y="280"
        width="140"
        height="80"
        fill="white"
        rx="8"
        stroke="#06b6d4"
        strokeWidth="2"
        className="shadow-md"
      />
      <rect x="495" y="295" width="24" height="24" fill="#cffafe" rx="4" />
      <rect x="530" y="300" width="80" height="4" fill="#111827" rx="2" />
      <rect x="530" y="308" width="60" height="3" fill="#6b7280" rx="1.5" />
      <text
        x="550"
        y="335"
        textAnchor="middle"
        className="text-xs font-medium"
        fill="#06b6d4"
      >
        Output Node
      </text>
    </g>

    {/* Vertical connections */}
    <g>
      <path
        d="M150 220 L150 280"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeDasharray="4,4"
      />
      <circle cx="150" cy="220" r="4" fill="#3b82f6" />
      <circle cx="150" cy="280" r="4" fill="#8b5cf6" />
    </g>

    <g>
      <path
        d="M350 220 L350 280"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeDasharray="4,4"
      />
      <circle cx="350" cy="220" r="4" fill="#10b981" />
      <circle cx="350" cy="280" r="4" fill="#ec4899" />
    </g>

    <g>
      <path
        d="M550 220 L550 280"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeDasharray="4,4"
      />
      <circle cx="550" cy="220" r="4" fill="#f59e0b" />
      <circle cx="550" cy="280" r="4" fill="#06b6d4" />
    </g>

    {/* Floating action buttons */}
    <g>
      <circle cx="720" cy="120" r="28" fill="#111827" className="shadow-lg" />
      <Play className="w-5 h-5" x="717.5" y="117.5" fill="white" />
    </g>

    <g>
      <circle
        cx="720"
        cy="180"
        r="28"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1"
        className="shadow-lg"
      />
      <Settings className="w-5 h-5" x="717.5" y="177.5" fill="#111827" />
    </g>

    <g>
      <circle
        cx="720"
        cy="240"
        r="28"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1"
        className="shadow-lg"
      />
      <Palette className="w-5 h-5" x="717.5" y="237.5" fill="#111827" />
    </g>

    {/* Progress indicator */}
    <g>
      <rect x="60" y="400" width="680" height="6" fill="#f3f4f6" rx="3" />
      <rect x="60" y="400" width="480" height="6" fill="#111827" rx="3" />
      <text
        x="400"
        y="420"
        textAnchor="middle"
        className="text-sm font-medium"
        fill="#6b7280"
      >
        Flow Progress: 71%
      </text>
    </g>

    {/* Node palette */}
    <rect
      x="60"
      y="440"
      width="200"
      height="40"
      fill="#f9fafb"
      rx="6"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="75" y="450" width="20" height="20" fill="#111827" rx="3" />
    <rect x="105" y="455" width="60" height="3" fill="#111827" rx="1.5" />
    <rect x="105" y="460" width="40" height="2" fill="#6b7280" rx="1" />
    <text x="170" y="465" className="text-xs" fill="#6b7280">
      Node Library
    </text>
  </svg>
);

const flowCapabilities = [
  {
    icon: Zap,
    label: "Real-time",
    value: "Live collaboration",
    color: "bg-yellow-50",
  },
  {
    icon: GitBranch,
    label: "Version Control",
    value: "Branch & merge",
    color: "bg-blue-50",
  },
  {
    icon: Code,
    label: "Custom Nodes",
    value: "Extend functionality",
    color: "bg-green-50",
  },
  {
    icon: Database,
    label: "Integrations",
    value: "Connect APIs",
    color: "bg-purple-50",
  },
];

export default function VisualFlowBuilderFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Design</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Visual */}
          <div className="lg:col-span-3 p-8 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <AnimatedFlowBuilderSVG />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <Grid2X2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Visual Flow Builder
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Design with confidence
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Create complex application flows visually with our intuitive
              drag-and-drop interface. Connect nodes, define logic, and build
              sophisticated workflows without writing a single line of code.
            </p>

            {/* Capabilities Grid */}
            <div className="grid grid-cols-2 gap-3">
              {flowCapabilities.map((capability, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border border-gray-200 ${capability.color} hover:shadow-md transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <capability.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {capability.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {capability.value}
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
                  Start Building
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
        </div>

        {/* Enhanced Features Section */}
        <div className="border-t border-gray-200 bg-gradient-to-l from-gray-50 to-white p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drag & Drop
              </h3>
              <p className="text-sm text-gray-600">
                Intuitive visual interface for building complex flows
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Version Control
              </h3>
              <p className="text-sm text-gray-600">
                Branch, merge, and track changes in your flows
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Nodes
              </h3>
              <p className="text-sm text-gray-600">
                Extend functionality with your own node types
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
