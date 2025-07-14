"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
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
import { AssetUploadDialog } from "./_components/asset-upload-dialog";
import { AssetLinkDialog } from "./_components/asset-link-dialog";
import { AssetEditDialog } from "./_components/asset-edit-dialog";
import { AssetGrid } from "./_components/asset-grid";
import { AssetList } from "./_components/asset-list";

const ASSET_TYPES = [
  { value: "all", label: "All Types", icon: FolderOpen },
  { value: "image", label: "Images", icon: Image },
  { value: "document", label: "Documents", icon: File },
  { value: "video", label: "Videos", icon: Video },
  { value: "link", label: "Links", icon: Link },
  { value: "code", label: "Code", icon: Code },
  { value: "design", label: "Design", icon: Palette },
  { value: "other", label: "Other", icon: File },
];

const ASSET_CATEGORIES = [
  { value: "all", label: "All Categories" },
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

const AssetsPage = () => {
  const params = useParams();
  const { token } = useSession();
  const projectId = params.id as string;

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Queries
  const assets = useQuery(
    api.assets.getProjectAssets,
    token
      ? {
          token,
          projectId: projectId as any,
          type: selectedType !== "all" ? (selectedType as any) : undefined,
          category:
            selectedCategory !== "all" ? (selectedCategory as any) : undefined,
        }
      : "skip"
  );

  // Mutations
  const deleteAssetMutation = useMutation(api.assets.deleteAsset);

  // Filter assets based on search query
  const filteredAssets =
    assets?.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ) || [];

  const handleDelete = async (assetId: string) => {
    if (!token) return;

    try {
      await deleteAssetMutation({
        token,
        assetId: assetId as any,
      });
      toast.success("Asset deleted successfully");
    } catch (error) {
      console.error("Failed to delete asset:", error);
      toast.error("Failed to delete asset");
    }
  };

  const handleUpdate = (assetId: string) => {
    const asset = assets?.find((a) => a._id === assetId);
    if (asset) {
      setSelectedAsset(asset);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedAsset(null);
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
              open={isUploadDialogOpen}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
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
            <Select value={selectedType} onValueChange={setSelectedType}>
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
              onValueChange={setSelectedCategory}
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
        </CardContent>
      </Card>

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
          open={isEditDialogOpen}
        />
      )}
    </div>
  );
};

export default AssetsPage;
