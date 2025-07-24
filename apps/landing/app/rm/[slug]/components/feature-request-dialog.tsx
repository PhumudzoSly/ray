"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as roadmapActions from "@/actions/roadmap";
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
  Mail,
  User,
  MessageSquare,
  Tag,
} from "lucide-react";
import { CategoryIcon, categoryConfig } from "./roadmap-category-icons";

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

  const submitFeatureRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await roadmapActions.createFeatureRequest(data);
      if (!res?.success) {
        throw new Error(res?.error || "Failed to submit feature request");
      }
      return res.data;
    },
    onSuccess: () => {
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
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit feature request");
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

    try {
      const ip = await getUserIp();

      submitFeatureRequestMutation.mutate({
        roadmapId,
        title: title.trim(),
        description: description.trim(),
        category,
        email: email.trim(),
        name: name.trim() || undefined,
        ipAddress: ip,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to get IP address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Request a Feature
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share your idea for {roadmapName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Feature Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Feature Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Dark mode support"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-9"
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a category">
                  {category && (
                    <div className="flex items-center gap-2">
                      <CategoryIcon categoryId={category} className="w-4 h-4" />
                      <span>
                        {categoryConfig[category as keyof typeof categoryConfig]
                          ?.label || category}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories
                    .filter((cat) => {
                      const inappropriateCategories = [
                        "BUG",
                        "CANCELLED",
                        "BLOCKED",
                      ];
                      return !inappropriateCategories.includes(
                        cat.toUpperCase()
                      );
                    })
                    .map((cat) => {
                      const categoryInfo =
                        categoryConfig[
                          cat.toUpperCase() as keyof typeof categoryConfig
                        ];
                      return (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <CategoryIcon
                              categoryId={cat.toUpperCase()}
                              className="w-4 h-4"
                            />
                            <span>{categoryInfo?.label || cat}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                ) : (
                  <>
                    <SelectItem
                      value="FEATURE"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <CategoryIcon
                          categoryId="FEATURE"
                          className="w-4 h-4"
                        />
                        <span>Feature</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="IMPROVEMENT"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <CategoryIcon
                          categoryId="IMPROVEMENT"
                          className="w-4 h-4"
                        />
                        <span>Improvement</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="UI" className="flex items-center gap-2">
                      <div className="flex items-center gap-2 w-full">
                        <CategoryIcon categoryId="UI" className="w-4 h-4" />
                        <span>UI Enhancement</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="PERFORMANCE"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <CategoryIcon
                          categoryId="PERFORMANCE"
                          className="w-4 h-4"
                        />
                        <span>Performance</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="DESIGN"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <CategoryIcon categoryId="DESIGN" className="w-4 h-4" />
                        <span>Design</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="DOCUMENTATION"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <CategoryIcon
                          categoryId="DOCUMENTATION"
                          className="w-4 h-4"
                        />
                        <span>Documentation</span>
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your feature request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name (Optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitFeatureRequestMutation.isPending}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitFeatureRequestMutation.isPending}
              className="h-9"
            >
              {submitFeatureRequestMutation.isPending ? (
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
      </DialogContent>
    </Dialog>
  );
}
