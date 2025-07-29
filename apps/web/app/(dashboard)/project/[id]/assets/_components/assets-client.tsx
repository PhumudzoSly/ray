"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Dialog, DialogTrigger } from "@workspace/ui/components/dialog";
import {
  Upload,
  Link,
  Search,
  Grid,
  List,
  File,
  Image,
  Video,
  Code,
  Palette,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { AssetUploadDialog } from "./asset-upload-dialog";
import { AssetLinkDialog } from "./asset-link-dialog";
import { AssetEditDialog } from "./asset-edit-dialog";
import { AssetGrid } from "./asset-grid";
import { AssetList } from "./asset-list";
import * as assetActions from "@/actions/project/assets";
import type { Asset } from "@/actions/project/assets";
import type { AssetTypeType, AssetCategoryType } from "@workspace/backend";

const ASSET_TYPES = [
  { value: "all", label: "All Types", icon: FolderOpen },
  { value: "image", label: "Images", icon: Image },
  { value: "document", label: "Documents", icon: File },
  { value: "video", label: "Videos", icon: Video },
  { value: "link", label: "Links", icon: Link },
  { value: "code", label: "Code", icon: Code },
  { value: "design", label: "Design", icon: Palette },
  { value: "other", label: "Other", icon: File },
] as const;

const ASSET_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "branding", label: "Branding" },
  { value: "ui_design", label: "UI Design" },
  { value: "mockups", label: "Mockups" },
  { value: "documentation", label: "Documentation" },
  { value: "inspiration", label: "Inspiration" },
  { value: "code_snippets", label: "Code Snippets" },
  { value: "presentations", label: "Presentations" },
  { value: "tutorials", label: "Tutorials" },
  { value: "other", label: "Other" },
] as const;

interface AssetsClientProps {
  projectId: string;
  initialAssets: Asset[];
}

export const AssetsClient = ({
  projectId,
  initialAssets,
}: AssetsClientProps) => {
  const queryClient = useQueryClient();

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<AssetTypeType | "all">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<
    AssetCategoryType | "all"
  >("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // React Query for assets data
  const { data: assets = initialAssets, isLoading } = useQuery({
    queryKey: ["projectAssets", projectId],
    queryFn: () => assetActions.getProjectAssets({ projectId }),
    initialData: initialAssets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter assets based on current state
  const filteredAssets = assets.filter((asset) => {
    // Type filter
    if (selectedType !== "all" && asset.type !== selectedType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && asset.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        asset.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Mutations
  const deleteAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: string }) =>
      assetActions.deleteAsset({ assetId }),
    onSuccess: () => {
      // Invalidate and refetch assets
      queryClient.invalidateQueries({ queryKey: ["projectAssets", projectId] });
      toast.success("Asset deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete asset:", error);
      toast.error("Failed to delete asset");
    },
  });

  const handleDelete = async (assetId: string) => {
    await deleteAssetMutation.mutateAsync({ assetId });
  };

  const handleUpdate = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      setSelectedAsset(asset);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedAsset(null);
  };

  const handleAssetCreated = () => {
    // Invalidate and refetch assets
    queryClient.invalidateQueries({ queryKey: ["projectAssets", projectId] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Assets</h1>
          <p className="text-muted-foreground">
            Manage files, links, and resources for your project
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Link className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <AssetLinkDialog
              projectId={projectId}
              onClose={() => setIsLinkDialogOpen(false)}
              onSuccess={handleAssetCreated}
              open={isLinkDialogOpen}
            />
          </Dialog>

          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </DialogTrigger>
            <AssetUploadDialog
              projectId={projectId}
              onClose={() => setIsUploadDialogOpen(false)}
              onSuccess={handleAssetCreated}
              open={isUploadDialogOpen}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type Filter */}
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setSelectedType(value as AssetTypeType | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) =>
            setSelectedCategory(value as AssetCategoryType | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Assets Display */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <File className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No assets found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ||
                  selectedType !== "all" ||
                  selectedCategory !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "Get started by uploading your first asset"}
                </p>
              </div>
              {!searchQuery &&
                selectedType === "all" &&
                selectedCategory === "all" && (
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Asset
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsLinkDialogOpen(true)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {viewMode === "grid" ? (
            <AssetGrid
              assets={filteredAssets}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ) : (
            <AssetList
              assets={filteredAssets}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {selectedAsset && (
        <AssetEditDialog
          asset={selectedAsset}
          onClose={handleEditDialogClose}
          onSuccess={handleAssetCreated}
          open={isEditDialogOpen}
        />
      )}

      {/* Upload Dialog */}
      <AssetUploadDialog
        projectId={projectId}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleAssetCreated}
        open={isUploadDialogOpen}
      />

      {/* Link Dialog */}
      <AssetLinkDialog
        projectId={projectId}
        onClose={() => setIsLinkDialogOpen(false)}
        onSuccess={handleAssetCreated}
        open={isLinkDialogOpen}
      />
    </div>
  );
};
