import Link from "next/link";
import { Construction, BookOpen, Code, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <BookOpen className="h-16 w-16 text-primary" />
            <Construction className="h-6 w-6 text-primary/60 absolute -top-2 -right-2" />
          </div>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Documentation Coming Soon
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          We're building comprehensive documentation for RayAI, the first ever
          SaaS management tool. Our team is working hard to bring you detailed
          guides and tutorials.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Link
            href="/docs"
            className="flex items-center justify-center space-x-2 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
          >
            <Code className="h-5 w-5 text-primary" />
            <span className="font-medium">View Documentation</span>
          </Link>

          <Link
            href="https://rayai.dev"
            className="flex items-center justify-center space-x-2 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
          >
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-medium">Visit RayAI</span>
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Team Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Seamless teamwork and communication
            </p>
          </div>

          <div className="text-center p-4">
            <Code className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Developer Tools</h3>
            <p className="text-sm text-muted-foreground">
              Powerful APIs and integrations
            </p>
          </div>

          <div className="text-center p-4">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent automation and insights
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Documentation will be available soon. Thank you for your patience!
        </p>
      </div>
    </main>
  );
}
