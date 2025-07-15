import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Mail } from "lucide-react";

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
            Contact our support team using the form below. We’ll get back to you
            as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-xl mx-auto px-4 py-16">
        <Card className="p-8">
          <form className="space-y-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <Input id="name" name="name" placeholder="Your name" required />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-foreground"
              >
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="How can we help you?"
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
