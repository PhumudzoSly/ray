"use client";

import { motion } from "framer-motion";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Validate Your Idea",
    description:
      "Get instant market validation with AI-powered research and competitor analysis",
    mockup: (
      <svg viewBox="0 0 400 240" className="w-full h-auto">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Browser Window */}
        <rect
          width="400"
          height="240"
          rx="8"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <rect
          width="400"
          height="32"
          rx="8"
          fill="#f9fafb"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Browser Dots */}
        <circle cx="16" cy="16" r="4" fill="#ef4444" />
        <circle cx="32" cy="16" r="4" fill="#f59e0b" />
        <circle cx="48" cy="16" r="4" fill="#10b981" />

        {/* URL Bar */}
        <rect
          x="80"
          y="8"
          width="200"
          height="16"
          rx="8"
          fill="#ffffff"
          stroke="#d1d5db"
        />
        <text x="85" y="18" fontSize="10" fill="#6b7280">
          ray.so/validate
        </text>

        {/* Main Content */}
        <text x="20" y="60" fontSize="14" fontWeight="600" fill="#111827">
          Idea Validation Report
        </text>

        {/* Progress Bar */}
        <rect x="20" y="75" width="360" height="8" rx="4" fill="#f3f4f6" />
        <rect x="20" y="75" width="280" height="8" rx="4" fill="#3b82f6" />
        <text x="20" y="100" fontSize="11" fill="#6b7280">
          Analyzing market demand...
        </text>

        {/* Validation Cards */}
        <rect
          x="20"
          y="115"
          width="165"
          height="45"
          rx="6"
          fill="#dcfce7"
          stroke="#16a34a"
          strokeWidth="1"
        />
        <text x="30" y="130" fontSize="10" fontWeight="600" fill="#166534">
          Market Demand
        </text>
        <text x="30" y="145" fontSize="12" fontWeight="700" fill="#15803d">
          High (8.7/10)
        </text>

        <rect
          x="215"
          y="115"
          width="165"
          height="45"
          rx="6"
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth="1"
        />
        <text x="225" y="130" fontSize="10" fontWeight="600" fill="#92400e">
          Competition
        </text>
        <text x="225" y="145" fontSize="12" fontWeight="700" fill="#b45309">
          Medium (5.2/10)
        </text>

        {/* Stats */}
        <text x="20" y="185" fontSize="11" fill="#6b7280">
          • 2,847 similar ideas analyzed
        </text>
        <text x="20" y="200" fontSize="11" fill="#6b7280">
          • 89% validation accuracy
        </text>
        <text x="20" y="215" fontSize="11" fill="#6b7280">
          • Generated in 3 minutes
        </text>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Build Your Roadmap",
    description:
      "Transform validated ideas into actionable development roadmaps with AI assistance",
    mockup: (
      <svg viewBox="0 0 400 240" className="w-full h-auto">
        {/* App Interface */}
        <rect
          width="400"
          height="240"
          rx="8"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect
          width="400"
          height="48"
          fill="#f8fafc"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="20" y="30" fontSize="14" fontWeight="600" fill="#111827">
          TaskFlow AI - Development Roadmap
        </text>

        {/* Sidebar */}
        <rect
          x="0"
          y="48"
          width="120"
          height="192"
          fill="#f1f5f9"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="10" y="70" fontSize="11" fontWeight="600" fill="#475569">
          Phases
        </text>
        <rect
          x="10"
          y="80"
          width="100"
          height="20"
          rx="4"
          fill="#3b82f6"
          fillOpacity="0.1"
        />
        <text x="15" y="92" fontSize="10" fill="#1e40af">
          MVP Development
        </text>
        <rect x="10" y="105" width="100" height="20" rx="4" fill="#f3f4f6" />
        <text x="15" y="117" fontSize="10" fill="#6b7280">
          User Testing
        </text>
        <rect x="10" y="130" width="100" height="20" rx="4" fill="#f3f4f6" />
        <text x="15" y="142" fontSize="10" fill="#6b7280">
          Launch Prep
        </text>

        {/* Main Content */}
        <text x="140" y="70" fontSize="12" fontWeight="600" fill="#111827">
          Phase 1: MVP Development
        </text>

        {/* Task Cards */}
        <rect
          x="140"
          y="85"
          width="240"
          height="35"
          rx="6"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <circle cx="155" cy="102" r="6" fill="#10b981" />
        <text x="170" y="100" fontSize="11" fontWeight="500" fill="#111827">
          User Authentication
        </text>
        <text x="170" y="112" fontSize="9" fill="#6b7280">
          Est. 3 days • High Priority
        </text>

        <rect
          x="140"
          y="130"
          width="240"
          height="35"
          rx="6"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <circle cx="155" cy="147" r="6" fill="#f59e0b" />
        <text x="170" y="145" fontSize="11" fontWeight="500" fill="#111827">
          Task Management Core
        </text>
        <text x="170" y="157" fontSize="9" fill="#6b7280">
          Est. 5 days • High Priority
        </text>

        <rect
          x="140"
          y="175"
          width="240"
          height="35"
          rx="6"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <circle cx="155" cy="192" r="6" fill="#6b7280" />
        <text x="170" y="190" fontSize="11" fontWeight="500" fill="#111827">
          AI Integration
        </text>
        <text x="170" y="202" fontSize="9" fill="#6b7280">
          Est. 7 days • Medium Priority
        </text>

        {/* Progress indicator */}
        <text x="140" y="230" fontSize="10" fill="#6b7280">
          12 tasks • 3 completed • 15 days remaining
        </text>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Launch & Scale",
    description:
      "Deploy your validated product and scale with data-driven insights and growth strategies",
    mockup: (
      <svg viewBox="0 0 400 240" className="w-full h-auto">
        {/* Dashboard Interface */}
        <rect
          width="400"
          height="240"
          rx="8"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="400" height="40" fill="#111827" />
        <text x="20" y="25" fontSize="14" fontWeight="600" fill="#ffffff">
          Ray Analytics Dashboard
        </text>
        <circle cx="360" cy="20" r="8" fill="#10b981" />
        <text x="375" y="24" fontSize="10" fill="#ffffff">
          Live
        </text>

        {/* Stats Cards */}
        <rect
          x="20"
          y="60"
          width="85"
          height="50"
          rx="6"
          fill="#f0f9ff"
          stroke="#0ea5e9"
          strokeWidth="1"
        />
        <text x="25" y="75" fontSize="10" fill="#0369a1">
          Active Users
        </text>
        <text x="25" y="95" fontSize="18" fontWeight="700" fill="#0c4a6e">
          2,847
        </text>
        <text x="25" y="105" fontSize="8" fill="#0369a1">
          ↑ 23%
        </text>

        <rect
          x="115"
          y="60"
          width="85"
          height="50"
          rx="6"
          fill="#f0fdf4"
          stroke="#22c55e"
          strokeWidth="1"
        />
        <text x="120" y="75" fontSize="10" fill="#15803d">
          Revenue
        </text>
        <text x="120" y="95" fontSize="18" fontWeight="700" fill="#166534">
          $12.4k
        </text>
        <text x="120" y="105" fontSize="8" fill="#15803d">
          ↑ 45%
        </text>

        <rect
          x="210"
          y="60"
          width="85"
          height="50"
          rx="6"
          fill="#fef7ff"
          stroke="#a855f7"
          strokeWidth="1"
        />
        <text x="215" y="75" fontSize="10" fill="#7c3aed">
          Conversion
        </text>
        <text x="215" y="95" fontSize="18" fontWeight="700" fill="#6b21a8">
          8.7%
        </text>
        <text x="215" y="105" fontSize="8" fill="#7c3aed">
          ↑ 12%
        </text>

        <rect
          x="305"
          y="60"
          width="75"
          height="50"
          rx="6"
          fill="#fffbeb"
          stroke="#f59e0b"
          strokeWidth="1"
        />
        <text x="310" y="75" fontSize="10" fill="#d97706">
          Churn Rate
        </text>
        <text x="310" y="95" fontSize="18" fontWeight="700" fill="#b45309">
          2.1%
        </text>
        <text x="310" y="105" fontSize="8" fill="#d97706">
          ↓ 8%
        </text>

        {/* Growth Chart */}
        <rect
          x="20"
          y="130"
          width="200"
          height="90"
          rx="6"
          fill="#f8fafc"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="25" y="145" fontSize="11" fontWeight="600" fill="#111827">
          Growth Trajectory
        </text>

        {/* Chart Lines */}
        <polyline
          points="30,200 50,180 70,160 90,140 110,120 130,100 150,85 170,75 190,70 210,65"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        <polyline
          points="30,210 50,205 70,195 90,185 110,175 130,165 150,155 170,145 190,140 210,135"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Legend */}
        <rect x="35" y="155" width="8" height="2" fill="#3b82f6" />
        <text x="48" y="160" fontSize="9" fill="#6b7280">
          Users
        </text>
        <rect x="85" y="155" width="8" height="2" fill="#10b981" />
        <text x="98" y="160" fontSize="9" fill="#6b7280">
          Revenue
        </text>

        {/* Recommendations */}
        <rect
          x="240"
          y="130"
          width="140"
          height="90"
          rx="6"
          fill="#f8fafc"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="245" y="145" fontSize="11" fontWeight="600" fill="#111827">
          AI Recommendations
        </text>

        <rect x="245" y="155" width="130" height="18" rx="4" fill="#dcfce7" />
        <text x="250" y="166" fontSize="9" fill="#166534">
          Optimize onboarding flow
        </text>

        <rect x="245" y="178" width="130" height="18" rx="4" fill="#fef3c7" />
        <text x="250" y="189" fontSize="9" fill="#92400e">
          A/B test pricing page
        </text>

        <rect x="245" y="201" width="130" height="18" rx="4" fill="#dbeafe" />
        <text x="250" y="212" fontSize="9" fill="#1e40af">
          Launch referral program
        </text>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge variant="outline" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            From Idea to Launch in 3 Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform guides you through every stage of product
            development
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-6 h-full border-2 hover:border-primary/20 transition-colors">
                {/* Step Number */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                </div>

                {/* Mockup */}
                <div className="mb-4 bg-muted/30 rounded-lg p-4 border">
                  {step.mockup}
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </Card>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
