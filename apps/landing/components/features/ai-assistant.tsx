import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  Brain,
  MessageSquare,
  Code,
  Zap,
  Bot,
  Sparkles,
  Cpu,
  Network,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

const AINeuralNetworkSVG = () => (
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

    {/* Neural Network Nodes */}
    {/* Input Layer */}
    <circle cx="150" cy="100" r="6" fill="#111827" opacity="0.8">
      <animate
        attributeName="opacity"
        values="0.8;1;0.8"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="150" cy="150" r="6" fill="#111827" opacity="0.8">
      <animate
        attributeName="opacity"
        values="0.8;1;0.8"
        dur="2.5s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="150" cy="200" r="6" fill="#111827" opacity="0.8">
      <animate
        attributeName="opacity"
        values="0.8;1;0.8"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="150" cy="250" r="6" fill="#111827" opacity="0.8">
      <animate
        attributeName="opacity"
        values="0.8;1;0.8"
        dur="2.2s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Hidden Layer 1 */}
    <circle cx="300" cy="80" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="300" cy="130" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="2.8s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="300" cy="180" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="2.1s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="300" cy="230" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="1.9s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="300" cy="280" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Hidden Layer 2 */}
    <circle cx="450" cy="100" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="2.3s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="450" cy="150" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="1.7s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="450" cy="200" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="2.6s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="450" cy="250" r="6" fill="#111827" opacity="0.9">
      <animate
        attributeName="opacity"
        values="0.9;1;0.9"
        dur="2.0s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Output Layer */}
    <circle cx="600" cy="120" r="6" fill="#111827" opacity="1">
      <animate
        attributeName="opacity"
        values="1;0.7;1"
        dur="1.6s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="600" cy="180" r="6" fill="#111827" opacity="1">
      <animate
        attributeName="opacity"
        values="1;0.7;1"
        dur="2.7s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="600" cy="240" r="6" fill="#111827" opacity="1">
      <animate
        attributeName="opacity"
        values="1;0.7;1"
        dur="1.9s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Neural Connections */}
    <line
      x1="156"
      y1="100"
      x2="294"
      y2="80"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="100"
      x2="294"
      y2="130"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="100"
      x2="294"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="100"
      x2="294"
      y2="230"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="100"
      x2="294"
      y2="280"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="156"
      y1="150"
      x2="294"
      y2="80"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="150"
      x2="294"
      y2="130"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="150"
      x2="294"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="150"
      x2="294"
      y2="230"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="150"
      x2="294"
      y2="280"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="156"
      y1="200"
      x2="294"
      y2="80"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="200"
      x2="294"
      y2="130"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="200"
      x2="294"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="200"
      x2="294"
      y2="230"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="200"
      x2="294"
      y2="280"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="156"
      y1="250"
      x2="294"
      y2="80"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="250"
      x2="294"
      y2="130"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="250"
      x2="294"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="250"
      x2="294"
      y2="230"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="156"
      y1="250"
      x2="294"
      y2="280"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    {/* Layer 2 Connections */}
    <line
      x1="306"
      y1="80"
      x2="444"
      y2="100"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="80"
      x2="444"
      y2="150"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="80"
      x2="444"
      y2="200"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="80"
      x2="444"
      y2="250"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="306"
      y1="130"
      x2="444"
      y2="100"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="130"
      x2="444"
      y2="150"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="130"
      x2="444"
      y2="200"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="130"
      x2="444"
      y2="250"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="306"
      y1="180"
      x2="444"
      y2="100"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="180"
      x2="444"
      y2="150"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="180"
      x2="444"
      y2="200"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="180"
      x2="444"
      y2="250"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="306"
      y1="230"
      x2="444"
      y2="100"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="230"
      x2="444"
      y2="150"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="230"
      x2="444"
      y2="200"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="230"
      x2="444"
      y2="250"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="306"
      y1="280"
      x2="444"
      y2="100"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="280"
      x2="444"
      y2="150"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="280"
      x2="444"
      y2="200"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="306"
      y1="280"
      x2="444"
      y2="250"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    {/* Output Connections */}
    <line
      x1="456"
      y1="100"
      x2="594"
      y2="120"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="100"
      x2="594"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="100"
      x2="594"
      y2="240"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="456"
      y1="150"
      x2="594"
      y2="120"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="150"
      x2="594"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="150"
      x2="594"
      y2="240"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="456"
      y1="200"
      x2="594"
      y2="120"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="200"
      x2="594"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="200"
      x2="594"
      y2="240"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    <line
      x1="456"
      y1="250"
      x2="594"
      y2="120"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="250"
      x2="594"
      y2="180"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />
    <line
      x1="456"
      y1="250"
      x2="594"
      y2="240"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.6"
    />

    {/* Data Flow Animation */}
    <circle cx="160" cy="100" r="2" fill="#111827">
      <animate
        attributeName="cx"
        values="160;600"
        dur="3s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values="100;120"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="160" cy="150" r="2" fill="#111827">
      <animate
        attributeName="cx"
        values="160;600"
        dur="3.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values="150;180"
        dur="3.5s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="160" cy="200" r="2" fill="#111827">
      <animate
        attributeName="cx"
        values="160;600"
        dur="2.8s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values="200;240"
        dur="2.8s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Floating AI Particles */}
    <circle cx="200" cy="50" r="1.5" fill="#111827" opacity="0.4">
      <animate
        attributeName="cx"
        values="200;220;200"
        dur="4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values="50;40;50"
        dur="4s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="500" cy="60" r="1" fill="#111827" opacity="0.3">
      <animate
        attributeName="cx"
        values="500;520;500"
        dur="5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values="60;50;60"
        dur="5s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="650" cy="70" r="1.5" fill="#111827" opacity="0.5">
      <animate
        attributeName="cx"
        values="650;670;650"
        dur="3.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        values="70;60;70"
        dur="3.5s"
        repeatCount="indefinite"
      />
    </circle>

    {/* AI Response Bubbles */}
    <rect
      x="650"
      y="300"
      width="120"
      height="60"
      fill="#f9fafb"
      rx="8"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="660" y="310" width="100" height="3" fill="#111827" rx="1.5" />
    <rect x="660" y="315" width="80" height="2" fill="#6b7280" rx="1" />
    <rect x="660" y="320" width="90" height="2" fill="#6b7280" rx="1" />
    <rect x="660" y="325" width="70" height="2" fill="#6b7280" rx="1" />
    <rect x="660" y="330" width="85" height="2" fill="#6b7280" rx="1" />
    <rect x="660" y="335" width="60" height="2" fill="#6b7280" rx="1" />

    <rect x="30" y="300" width="100" height="50" fill="#111827" rx="8" />
    <rect x="40" y="310" width="80" height="3" fill="white" rx="1.5" />
    <rect x="40" y="315" width="70" height="2" fill="white" rx="1" />
    <rect x="40" y="320" width="60" height="2" fill="white" rx="1" />
    <rect x="40" y="325" width="75" height="2" fill="white" rx="1" />
    <rect x="40" y="330" width="50" height="2" fill="white" rx="1" />
  </svg>
);

const aiCapabilities = [
  {
    icon: Cpu,
    value: "GPT-4",
    label: "Powered by",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Network,
    value: "∞",
    label: "Context Aware",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Zap,
    value: "24/7",
    label: "Always Available",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Lightbulb,
    value: "100+",
    label: "AI Tools",
    color: "bg-rose-50 text-rose-600",
  },
];

const aiFeatures = [
  "Intelligent code generation and optimization",
  "Real-time project context understanding",
  "Automated bug detection and fixes",
  "Smart architecture recommendations",
  "Natural language project queries",
  "Continuous learning and adaptation",
];

export default function AIAssistantFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">AI</Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* Left Content */}
          <div className="lg:col-span-2 p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    AI Assistant
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Neural intelligence at work
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Experience the future of development with our neural
              network-powered AI assistant. Understands your codebase, generates
              intelligent solutions, and adapts to your unique development
              patterns.
            </p>

            {/* AI Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {aiCapabilities.map((capability, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${capability.color} border border-current/20`}
                >
                  <div className="flex items-center gap-3">
                    <capability.icon className="w-5 h-5" />
                    <div>
                      <div className="text-xl font-bold">
                        {capability.value}
                      </div>
                      <div className="text-xs opacity-80">
                        {capability.label}
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
                  Try AI Assistant
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
              <AINeuralNetworkSVG />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-200 bg-gradient-to-l from-gray-50 to-white p-8 md:p-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Advanced AI capabilities
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
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
