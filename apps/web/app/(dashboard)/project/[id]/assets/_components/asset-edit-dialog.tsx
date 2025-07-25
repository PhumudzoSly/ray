"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as assetActions from "@/actions/project/assets";
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
import { X, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";

interface AssetEditDialogProps {
  asset: any;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

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

export function AssetEditDialog({
  asset,
  onClose,
  onSuccess,
  open,
}: AssetEditDialogProps) {
  const { token } = useSession();
  const queryClient = useQueryClient();
  
  // Form state
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetCategory, setAssetCategory] = useState<string>("");
  const [assetTags, setAssetTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Reset form when dialog opens with asset data
  useEffect(() => {
    if (open && asset) {
      setAssetName(asset.name || "");
      setAssetDescription(asset.description || "");
      setAssetCategory(asset.category || "");
      setAssetTags(asset.tags || []);
      setTagInput("");
    }
  }, [open, asset]);

  // TanStack Query mutation for updating asset
  const updateAssetMutation = useMutation({
    mutationFn: async ({
      assetId,
      name,
      description,
      category,
      tags,
    }: {
      assetId: string;
      name: string;
      description?: string;
      category?: string;
      tags?: string[];
    }) => {
      return await assetActions.updateAsset({
        assetId,
        name,
        description,
        category,
        tags,
      });
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ["projectAssets", asset?.projectId] 
      });

      // Snapshot the previous value
      const previousAssets = queryClient.getQueryData([
        "projectAssets", 
        asset?.projectId
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["projectAssets", asset?.projectId], 
        (old: any) => {
          if (!old) return old;
          return old.map((a: any) =>
            a.id === variables.assetId 
              ? { 
                  ...a, 
                  name: variables.name,
                  description: variables.description,
                  category: variables.category,
                  tags: variables.tags || [],
                  updatedAt: new Date(),
                } 
              : a
          );
        }
      );

      // Return a context object with the snapshotted value
      return { previousAssets };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAssets) {
        queryClient.setQueryData(
          ["projectAssets", asset?.projectId], 
          context.previousAssets
        );
      }
      toast.error("Failed to update asset");
    },
    onSuccess: (data, variables) => {
      toast.success("Asset updated successfully");
      
      // Invalidate and refetch assets to get the real data from server
      queryClient.invalidateQueries({ 
        queryKey: ["projectAssets", asset?.projectId] 
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      onClose();
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: ["projectAssets", asset?.projectId] 
      });
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !assetTags.includes(tagInput.trim())) {
      setAssetTags([...assetTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setAssetTags(assetTags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpdate = async () => {
    if (!assetName.trim() || !token || !asset) return;

    try {
      await updateAssetMutation.mutateAsync({
        assetId: asset.id,
        name: assetName.trim(),
        description: assetDescription.trim() || undefined,
        category: assetCategory || undefined,
        tags: assetTags.length > 0 ? assetTags : undefined,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Failed to update asset:", error);
    }
  };

  const canUpdate = assetName.trim() && !updateAssetMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update the metadata for this asset. Changes will be saved
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="asset-name">Name *</Label>
            <Input
              id="asset-name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Enter asset name"
            />
          </div>

          {/* Asset Description */}
          <div className="space-y-2">
            <Label htmlFor="asset-description">Description</Label>
            <Textarea
              id="asset-description"
              value={assetDescription}
              onChange={(e) => setAssetDescription(e.target.value)}
              placeholder="Describe this asset..."
              rows={3}
            />
          </div>

          {/* Asset Category */}
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

          {/* Asset Tags */}
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

          {/* Asset Info Display */}
          <div className="space-y-2">
            <Label>Asset Information</Label>
            <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{asset?.type}</span>
              </div>
              {asset?.fileSize && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">
                    {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
              {asset?.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={updateAssetMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={!canUpdate}
          >
            {updateAssetMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Update Asset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
