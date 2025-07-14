"use client";

import { motion } from "framer-motion";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Star, Quote, TrendingUp, Zap, Target } from "lucide-react";

const testimonials = [
  {
    quote:
      "Ray turned my failed ideas into a validated roadmap. I launched my SaaS in 6 weeks instead of 6 months. The idea validation feature saved me from building something nobody wanted.",
    name: "Alex Chen",
    role: "Indie Founder",
    company: "TaskFlow AI",
    avatar: "AC",
    metric: "6 weeks to launch",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    quote:
      "The Growth AI insights boosted our user retention by 40%. Ray's feedback analysis helped us identify exactly what features users actually needed vs what we thought they needed.",
    name: "Sarah Martinez",
    role: "CEO",
    company: "DataSync Pro",
    avatar: "SM",
    metric: "40% retention boost",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    quote:
      "Visual App Flows changed everything. We went from scattered feature requests to a clear, AI-generated roadmap that our whole team could follow. Game changer for product development.",
    name: "Michael Thompson",
    role: "Product Manager",
    company: "CloudBase",
    avatar: "MT",
    metric: "3x faster planning",
    icon: <Target className="w-4 h-4" />,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Join Builders Who Transformed Ideas into{" "}
            <span className="text-primary">Million-Dollar SaaS</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. See how Ray AI helped founders
            validate, build, and scale their SaaS products.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
                <div className="space-y-6">
                  {/* Quote */}
                  <div className="relative">
                    <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-lg leading-relaxed text-foreground relative z-10">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  {/* Metric Badge */}
                  <Badge variant="outline" className="w-fit">
                    {testimonial.icon}
                    <span className="ml-2 font-semibold">
                      {testimonial.metric}
                    </span>
                  </Badge>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-xl font-semibold text-foreground mb-4">
            Ready to see similar results?
          </p>
          <p className="text-lg text-muted-foreground">
            Join 2,500+ builders who've already transformed their ideas into
            successful SaaS products.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
