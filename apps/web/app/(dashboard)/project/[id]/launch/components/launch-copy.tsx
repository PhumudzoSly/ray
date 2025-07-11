"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Copy, MessageSquare, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface CopyItem {
  platform: string;
  title: string;
  tagline?: string;
  description: string;
  hashtags?: string[];
  isApproved: boolean;
  version: number;
}

interface LaunchCopyProps {
  copyItems: CopyItem[];
}

const platformIcons = {
  "product-hunt": "🚀",
  "hacker-news": "📰",
  twitter: "🐦",
  linkedin: "💼",
  reddit: "🔗",
  "indie-hackers": "🏗️",
  "dev-to": "👨‍💻",
  medium: "📝",
};

export function LaunchCopy({ copyItems }: LaunchCopyProps) {
  const handleCopy = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${platform} copy copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (copyItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No platform copy yet</h3>
        <p className="text-muted-foreground">
          Generate a launch plan to get platform-optimized copy
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {copyItems.map((copy) => (
        <div key={copy.platform} className="border rounded-lg p-6 space-y-4">
          {/* Platform Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {platformIcons[copy.platform as keyof typeof platformIcons] ||
                  "🌐"}
              </span>
              <div>
                <h3 className="font-medium capitalize">
                  {copy.platform.replace("-", " ")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Version {copy.version}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={copy.isApproved ? "default" : "secondary"}>
                {copy.isApproved ? "Approved" : "Draft"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `${copy.title}\n\n${copy.tagline || ""}\n\n${copy.description}${
                      copy.hashtags
                        ? `\n\n${copy.hashtags.map((tag) => `#${tag}`).join(" ")}`
                        : ""
                    }`,
                    copy.platform
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Copy Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Title</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(copy.title, `${copy.platform} title`)
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-md text-sm">
                {copy.title}
              </div>
            </div>

            {copy.tagline && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Tagline</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(copy.tagline!, `${copy.platform} tagline`)
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {copy.tagline}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Description</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(copy.description, `${copy.platform} description`)
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {copy.description}
              </div>
            </div>

            {copy.hashtags && copy.hashtags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Hashtags</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        copy.hashtags!.map((tag) => `#${tag}`).join(" "),
                        `${copy.platform} hashtags`
                      )
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {copy.hashtags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
