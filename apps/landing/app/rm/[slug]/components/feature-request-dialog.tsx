"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as featureRequestActions from "@/actions/roadmap/feature-requests";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Lightbulb,
  Send,
  Star,
  Sparkles,
  CheckCircle2,
  Mail,
  User,
  MessageSquare,
  Tag,
} from "lucide-react";

interface FeatureRequestDialogProps {
  roadmapId: string;
  trigger: React.ReactNode;
  categories: string[];
  roadmapName: string;
}

export function FeatureRequestDialog({
  roadmapId,
  trigger,
  categories,
  roadmapName,
}: FeatureRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userIp, setUserIp] = useState("");

  const submitFeatureRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await featureRequestActions.createFeatureRequest(data);
    },
  });

  // Get user IP address
  const getUserIp = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Failed to get IP address:", error);
      return "unknown";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !email.trim() || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const ip = await getUserIp();

      await submitFeatureRequestMutation.mutateAsync({
        roadmapId,
        title: title.trim(),
        description: description.trim(),
        category,
        status: "PENDING",
        priority: "MEDIUM",
        isPublic: true,
        upvotes: 0,
        name: name.trim() || undefined,
        ipAddress: ip,
      });

      toast.success(
        "Feature request submitted successfully! We'll review it and get back to you."
      );

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setEmail("");
      setName("");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feature request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Request a Feature
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Have an idea for {roadmapName}? We'd love to hear from you! Share
            your feature request and we'll consider it for our roadmap.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Feature benefits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    Why request features?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps us prioritize development and build
                    features that matter most to our users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to update you on the status of your request
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name (Optional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="ui-ux">UI/UX</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Feature Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Feature Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Dark mode support"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your feature request in detail. What problem does it solve? How would you use it?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
