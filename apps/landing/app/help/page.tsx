import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { 
  Search, 
  MessageCircle, 
  Mail, 
  BookOpen, 
  Video, 
  FileText,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

const helpCategories = [
  {
    title: "Getting Started",
    description: "Learn the basics of Ray AI",
    icon: <BookOpen className="w-6 h-6" />,
    articles: [
      "Creating your first project",
      "Setting up your workspace",
      "Inviting team members",
      "Basic navigation guide"
    ]
  },
  {
    title: "Features",
    description: "Deep dive into Ray AI features",
    icon: <FileText className="w-6 h-6" />,
    articles: [
      "Idea validation guide",
      "Project management workflows",
      "Visual app flows tutorial",
      "Public roadmap setup"
    ]
  },
  {
    title: "Tutorials",
    description: "Step-by-step video tutorials",
    icon: <Video className="w-6 h-6" />,
    articles: [
      "Building your first SaaS",
      "Team collaboration best practices",
      "Launch readiness checklist",
      "Growth analytics walkthrough"
    ]
  }
];

const popularArticles = [
  {
    title: "How to validate your SaaS idea",
    description: "Learn how to use Ray AI's validation tools to research your market and competition.",
    readTime: "5 min read"
  },
  {
    title: "Setting up your development workflow",
    description: "Best practices for organizing your projects and managing tasks with your team.",
    readTime: "8 min read"
  },
  {
    title: "Creating effective app flows",
    description: "Design user journeys that convert with our visual flow builder.",
    readTime: "6 min read"
  },
  {
    title: "Understanding launch readiness scores",
    description: "What the metrics mean and how to improve your launch readiness.",
    readTime: "4 min read"
  }
];

const contactOptions = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    icon: <MessageCircle className="w-6 h-6" />,
    action: "Start Chat",
    available: "Available 24/7"
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    icon: <Mail className="w-6 h-6" />,
    action: "Send Email",
    available: "Response within 4 hours"
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Badge variant="outline" className="mb-4">
            Help & Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions, browse our documentation, or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground">
            Find the information you need organized by topic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {helpCategories.map((category) => (
            <Card key={category.title} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-foreground">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                {category.articles.map((article, index) => (
                  <li key={index}>
                    <Link 
                      href="#" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      {article}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="w-full">
                View All Articles
              </Button>
            </Card>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Popular Articles
            </h2>
            <p className="text-lg text-muted-foreground">
              The most helpful articles from our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {article.readTime}
                  </span>
                  <Link 
                    href="#" 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Read Article
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Still need help?
          </h2>
          <p className="text-lg text-muted-foreground">
            Our support team is here to help you succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {contactOptions.map((option) => (
            <Card key={option.title} className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-foreground mx-auto mb-4">
                {option.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {option.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {option.description}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {option.available}
              </p>
              <Button className="w-full">
                {option.action}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Additional Resources
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore more ways to get the most out of Ray AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/features">
                View Features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                See Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 