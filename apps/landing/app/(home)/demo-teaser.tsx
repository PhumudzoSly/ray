"use client";

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Play, Sparkles, Users, Clock } from "lucide-react";
import Link from "next/link";

export default function DemoTeaser() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              See Ray in Action
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Watch Ray Transform Ideas Into
              <span className="text-primary"> Validated Products</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Ray's AI validates ideas, creates roadmaps, and builds
              products in minutes, not months.
            </p>
          </div>

          {/* Demo Video Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto"
          >
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-muted/50 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-primary text-primary-foreground rounded-full p-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  </div>
                </motion.button>

                {/* Demo Stats Overlay */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="font-medium">2,847 ideas validated</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Avg. 3 min setup</span>
                  </div>
                </div>
              </div>

              {/* Demo CTA */}
              <div className="p-6 bg-gradient-to-r from-background to-muted/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg">
                      Ready to validate your idea?
                    </h3>
                    <p className="text-muted-foreground">
                      Join 2,847+ founders who've validated their ideas with Ray
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      Watch Demo
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/signup">Try Ray Free</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live validation data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Real-time insights</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>AI-powered analysis</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
