"use client";
import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
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
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import {
  Link,
  X,
  Youtube,
  Figma,
  Github,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AssetLinkDialogProps {
  projectId: string;
  onClose: () => void;
  open: boolean;
}

const LINK_TYPES = [
  {
    value: "youtube",
    label: "YouTube",
    icon: Youtube,
    pattern: /youtube\.com|youtu\.be/,
  },
  { value: "figma", label: "Figma", icon: Figma, pattern: /figma\.com/ },
  { value: "github", label: "GitHub", icon: Github, pattern: /github\.com/ },
  {
    value: "notion",
    label: "Notion",
    icon: ExternalLink,
    pattern: /notion\.so/,
  },
  {
    value: "dribbble",
    label: "Dribbble",
    icon: ExternalLink,
    pattern: /dribbble\.com/,
  },
  {
    value: "behance",
    label: "Behance",
    icon: ExternalLink,
    pattern: /behance\.net/,
  },
  { value: "external", label: "External", icon: ExternalLink, pattern: /.*/ },
];

const ASSET_CATEGORIES = [
  { value: "branding", label: "Branding" },
  { value: "ui-design", label: "UI Design" },
  { value: "mockups", label: "Mockups" },
  { value: "documentation", label: "Documentation" },
  { value: "inspiration", label: "Inspiration" },
  { value: "code-snippets", label: "Code Snippets" },
  { value: "presentations", label: "Presentations" },
  { value: "tutorials", label: "Tutorials" },
  { value: "other", label: "Other" },
];

export function AssetLinkDialog({
  projectId,
  onClose,
  open,
}: AssetLinkDialogProps) {
  const { token } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState<string>("");
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetCategory, setAssetCategory] = useState<string>("");
  const [assetTags, setAssetTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setLinkUrl("");
      setLinkType("");
      setAssetName("");
      setAssetDescription("");
      setAssetCategory("");
      setAssetTags([]);
      setTagInput("");
    }
  }, [open]);

  // Mutations
  const createLinkAsset = useMutation(api.assets.createLinkAsset);

  const detectLinkType = (url: string): string => {
    const linkType = LINK_TYPES.find((type) => type.pattern.test(url));
    return linkType?.value || "external";
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    setLinkUrl(url);
    if (url && validateUrl(url)) {
      const detectedType = detectLinkType(url);
      setLinkType(detectedType);

      // Auto-generate name from URL if empty
      if (!assetName) {
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.replace(/^www\./, "");
          const pathname = urlObj.pathname.split("/").filter(Boolean).pop();
          const name = pathname || hostname;
          setAssetName(name.charAt(0).toUpperCase() + name.slice(1));
        } catch {
          // Ignore URL parsing errors
        }
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !assetTags.includes(tagInput.trim())) {
      setAssetTags([...assetTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setAssetTags(assetTags.filter((tag) => tag !== tagToRemove));
  };

  const handleCreate = async () => {
    if (!linkUrl || !assetName || !token) return;

    if (!validateUrl(linkUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsCreating(true);
    try {
      await createLinkAsset({
        token: token,
        projectId: projectId as any,
        name: assetName,
        description: assetDescription,
        url: linkUrl,
        linkType: linkType as any,
        category: assetCategory || "other",
        tags: assetTags.length > 0 ? assetTags : undefined,
      });

      toast.success("Link asset created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to create link asset:", error);
      toast.error("Failed to create link asset");
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate =
    linkUrl && assetName.trim() && validateUrl(linkUrl) && !isCreating;

  const getLinkTypeIcon = (type: string) => {
    const linkType = LINK_TYPES.find((lt) => lt.value === type);
    return linkType?.icon || ExternalLink;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Link Asset</DialogTitle>
          <DialogDescription>
            Add external links and resources to your project. We'll
            automatically detect the link type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="link-url">URL *</Label>
            <Input
              id="link-url"
              type="url"
              value={linkUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              className="font-mono text-sm"
            />
            {linkUrl && !validateUrl(linkUrl) && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                Please enter a valid URL
              </div>
            )}
          </div>

          {/* Link Type Detection */}
          {linkUrl && validateUrl(linkUrl) && (
            <div className="space-y-2">
              <Label>Detected Type</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {React.createElement(getLinkTypeIcon(linkType), {
                  className: "w-5 h-5",
                })}
                <span className="font-medium">
                  {LINK_TYPES.find((lt) => lt.value === linkType)?.label}
                </span>
                <Badge variant="secondary">Auto-detected</Badge>
              </div>
            </div>
          )}

          {/* Asset Metadata */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-name">Name *</Label>
                <Input
                  id="asset-name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-category">Category</Label>
                <Select value={assetCategory} onValueChange={setAssetCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-description">Description</Label>
              <Textarea
                id="asset-description"
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                placeholder="Describe this link..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="asset-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  placeholder="Add tags..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                >
                  Add
                </Button>
              </div>
              {assetTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {assetTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Add Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
