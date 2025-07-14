import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  Shield,
  Zap,
  Settings,
  Layers,
} from "lucide-react";
import Link from "next/link";

const TechStackSVG = () => (
  <svg viewBox="0 0 800 600" className="w-full h-full">
    {/* Background */}
    <rect
      width="800"
      height="600"
      fill="white"
      rx="12"
      stroke="#e5e7eb"
      strokeWidth="1"
    />

    {/* Central Hub */}
    <circle
      cx="400"
      cy="300"
      r="80"
      fill="white"
      stroke="#111827"
      strokeWidth="4"
    />
    <circle cx="400" cy="300" r="60" fill="#111827" />
    <rect x="385" y="285" width="30" height="30" fill="white" rx="6" />
    <rect x="390" y="290" width="20" height="20" fill="#111827" rx="4" />
    <text
      x="400"
      y="350"
      textAnchor="middle"
      className="text-lg font-bold"
      fill="#111827"
    >
      Ray AI
    </text>

    {/* Authentication Ring */}
    <circle
      cx="250"
      cy="150"
      r="50"
      fill="white"
      stroke="#111827"
      strokeWidth="3"
    />
    <circle cx="250" cy="150" r="30" fill="#111827" />
    <rect x="240" y="140" width="20" height="20" fill="white" rx="4" />
    <text
      x="250"
      y="115"
      textAnchor="middle"
      className="text-sm font-semibold"
      fill="#111827"
    >
      Auth
    </text>

    {/* Auth Providers */}
    <rect
      x="180"
      y="80"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="185" y="85" width="30" height="4" fill="#111827" rx="2" />
    <rect x="185" y="91" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="185" y="96" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text x="200" y="70" textAnchor="middle" className="text-xs" fill="#111827">
      Google
    </text>

    <rect
      x="240"
      y="80"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="245" y="85" width="30" height="4" fill="#111827" rx="2" />
    <rect x="245" y="91" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="245" y="96" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text x="260" y="70" textAnchor="middle" className="text-xs" fill="#111827">
      OAuth
    </text>

    <rect
      x="300"
      y="80"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="305" y="85" width="30" height="4" fill="#111827" rx="2" />
    <rect x="305" y="91" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="305" y="96" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text x="320" y="70" textAnchor="middle" className="text-xs" fill="#111827">
      GitHub
    </text>

    {/* Database Ring */}
    <circle
      cx="550"
      cy="150"
      r="50"
      fill="white"
      stroke="#111827"
      strokeWidth="3"
    />
    <circle cx="550" cy="150" r="30" fill="#111827" />
    <rect x="540" y="140" width="20" height="20" fill="white" rx="4" />
    <text
      x="550"
      y="115"
      textAnchor="middle"
      className="text-sm font-semibold"
      fill="#111827"
    >
      Database
    </text>

    {/* Database Options */}
    <rect
      x="480"
      y="80"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="485" y="85" width="30" height="4" fill="#111827" rx="2" />
    <rect x="485" y="91" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="485" y="96" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text x="500" y="70" textAnchor="middle" className="text-xs" fill="#111827">
      PostgreSQL
    </text>

    <rect
      x="540"
      y="80"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="545" y="85" width="30" height="4" fill="#111827" rx="2" />
    <rect x="545" y="91" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="545" y="96" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text x="560" y="70" textAnchor="middle" className="text-xs" fill="#111827">
      MongoDB
    </text>

    <rect
      x="600"
      y="80"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="605" y="85" width="30" height="4" fill="#111827" rx="2" />
    <rect x="605" y="91" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="605" y="96" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text x="620" y="70" textAnchor="middle" className="text-xs" fill="#111827">
      Redis
    </text>

    {/* Payment Ring */}
    <circle
      cx="250"
      cy="450"
      r="50"
      fill="white"
      stroke="#111827"
      strokeWidth="3"
    />
    <circle cx="250" cy="450" r="30" fill="#111827" />
    <rect x="240" y="440" width="20" height="20" fill="white" rx="4" />
    <text
      x="250"
      y="415"
      textAnchor="middle"
      className="text-sm font-semibold"
      fill="#111827"
    >
      Payments
    </text>

    {/* Payment Providers */}
    <rect
      x="180"
      y="520"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="185" y="525" width="30" height="4" fill="#111827" rx="2" />
    <rect x="185" y="531" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="185" y="536" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="200"
      y="510"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      Stripe
    </text>

    <rect
      x="240"
      y="520"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="245" y="525" width="30" height="4" fill="#111827" rx="2" />
    <rect x="245" y="531" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="245" y="536" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="260"
      y="510"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      PayPal
    </text>

    <rect
      x="300"
      y="520"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="305" y="525" width="30" height="4" fill="#111827" rx="2" />
    <rect x="305" y="531" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="305" y="536" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="320"
      y="510"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      Square
    </text>

    {/* Cloud Ring */}
    <circle
      cx="550"
      cy="450"
      r="50"
      fill="white"
      stroke="#111827"
      strokeWidth="3"
    />
    <circle cx="550" cy="450" r="30" fill="#111827" />
    <rect x="540" y="440" width="20" height="20" fill="white" rx="4" />
    <text
      x="550"
      y="415"
      textAnchor="middle"
      className="text-sm font-semibold"
      fill="#111827"
    >
      Cloud
    </text>

    {/* Cloud Providers */}
    <rect
      x="480"
      y="520"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="485" y="525" width="30" height="4" fill="#111827" rx="2" />
    <rect x="485" y="531" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="485" y="536" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="500"
      y="510"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      AWS
    </text>

    <rect
      x="540"
      y="520"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="545" y="525" width="30" height="4" fill="#111827" rx="2" />
    <rect x="545" y="531" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="545" y="536" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="560"
      y="510"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      Vercel
    </text>

    <rect
      x="600"
      y="520"
      width="40"
      height="25"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="605" y="525" width="30" height="4" fill="#111827" rx="2" />
    <rect x="605" y="531" width="25" height="3" fill="#6b7280" rx="1.5" />
    <rect x="605" y="536" width="20" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="620"
      y="510"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      Netlify
    </text>

    {/* Connection Lines */}
    <line
      x1="300"
      y1="200"
      x2="320"
      y2="220"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <line
      x1="500"
      y1="200"
      x2="480"
      y2="220"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <line
      x1="300"
      y1="400"
      x2="320"
      y2="380"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <line
      x1="500"
      y1="400"
      x2="480"
      y2="380"
      stroke="#d1d5db"
      strokeWidth="2"
    />

    {/* Additional Tech Stack Items */}
    <rect
      x="50"
      y="300"
      width="60"
      height="35"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="55" y="305" width="50" height="4" fill="#111827" rx="2" />
    <rect x="55" y="311" width="40" height="3" fill="#6b7280" rx="1.5" />
    <rect x="55" y="316" width="35" height="3" fill="#6b7280" rx="1.5" />
    <text x="80" y="290" textAnchor="middle" className="text-xs" fill="#111827">
      React
    </text>

    <rect
      x="690"
      y="300"
      width="60"
      height="35"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="695" y="305" width="50" height="4" fill="#111827" rx="2" />
    <rect x="695" y="311" width="40" height="3" fill="#6b7280" rx="1.5" />
    <rect x="695" y="316" width="35" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="720"
      y="290"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      Node.js
    </text>

    <rect
      x="50"
      y="400"
      width="60"
      height="35"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="55" y="405" width="50" height="4" fill="#111827" rx="2" />
    <rect x="55" y="411" width="40" height="3" fill="#6b7280" rx="1.5" />
    <rect x="55" y="416" width="35" height="3" fill="#6b7280" rx="1.5" />
    <text x="80" y="390" textAnchor="middle" className="text-xs" fill="#111827">
      TypeScript
    </text>

    <rect
      x="690"
      y="400"
      width="60"
      height="35"
      fill="#f9fafb"
      rx="4"
      stroke="#e5e7eb"
      strokeWidth="1"
    />
    <rect x="695" y="405" width="50" height="4" fill="#111827" rx="2" />
    <rect x="695" y="411" width="40" height="3" fill="#6b7280" rx="1.5" />
    <rect x="695" y="416" width="35" height="3" fill="#6b7280" rx="1.5" />
    <text
      x="720"
      y="390"
      textAnchor="middle"
      className="text-xs"
      fill="#111827"
    >
      Python
    </text>

    {/* Connection lines to additional items */}
    <line
      x1="110"
      y1="317"
      x2="130"
      y2="300"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <line
      x1="690"
      y1="317"
      x2="670"
      y2="300"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <line
      x1="110"
      y1="417"
      x2="130"
      y2="400"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <line
      x1="690"
      y1="417"
      x2="670"
      y2="400"
      stroke="#d1d5db"
      strokeWidth="2"
    />
  </svg>
);

const benefits = [
  "50+ pre-built integrations",
  "One-click setup and configuration",
  "Real-time data synchronization",
  "Custom webhook support",
  "API rate limiting and caching",
  "Secure credential management",
  "Multi-environment support",
  "Integration health monitoring",
  "Automated testing and validation",
];

export default function TechStackIntegrationFeature() {
  return (
    <div className="relative">
      <Card className="p-0 overflow-hidden bg-white border border-gray-200">
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-black text-white border-0">Integration</Badge>
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
                    Tech Stack Integration
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Connect everything seamlessly
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Integrate with your existing tech stack effortlessly. From
              authentication providers to databases, payment gateways to cloud
              platforms - we connect with everything you need.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Integrations</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">1-Click</div>
                <div className="text-sm text-gray-600">Setup</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white border-0"
                asChild
              >
                <Link href="/pricing">
                  Explore Integrations
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
              <TechStackSVG />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-8 md:p-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Everything you need to integrate your stack
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
