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

  const handleDeleteAsset = async (assetId: string) => {
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

  const getAssetStats = () => {
    if (!assets) return { total: 0, byType: {}, byCategory: {} };

    const byType = assets.reduce(
      (acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byCategory = assets.reduce(
      (acc, asset) => {
        const category = asset.category || "other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: assets.length,
      byType,
      byCategory,
    };
  };

  const stats = getAssetStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Assets</h1>
          <p className="text-muted-foreground">
            Manage files, links, and resources for your project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Link className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <AssetLinkDialog
              projectId={projectId}
              open={isLinkDialogOpen}
              onClose={() => setIsLinkDialogOpen(false)}
            />
          </Dialog>

          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <AssetUploadDialog
              projectId={projectId}
              open={isUploadDialogOpen}
              onClose={() => setIsUploadDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-1">
          <CardContent>
            <div className="flex items-center gap-3">
              <Button disabled size="icon" variant={"fancy"}>
                <FolderOpen />
              </Button>
              <div>
                <p className="text-sm font-medium">Total Assets</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-1">
          <CardContent>
            <div className="flex items-center gap-3">
              <Button disabled size="icon" variant={"fancy"}>
                <Image />
              </Button>
              <div>
                <p className="text-sm font-medium">Images</p>
                <p className="text-xl font-bold">{stats.byType.image || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-1">
          <CardContent>
            <div className="flex items-center gap-3">
              <Button disabled size="icon" variant={"fancy"}>
                <Link />
              </Button>
              <div>
                <p className="text-sm font-medium">Links</p>
                <p className="text-xl font-bold">{stats.byType.link || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-1">
          <CardContent>
            <div className="flex items-center gap-3">
              <Button disabled size="icon" variant={"fancy"}>
                <File />
              </Button>
              <div>
                <p className="text-sm font-medium">Documents</p>
                <p className="text-2xl font-bold">
                  {stats.byType.document || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <CardContent className="p-0">
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          <div className="flex items-center gap-1 border rounded-md p-1">
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

      {/* Assets Display */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No assets found</h3>
                <p className="text-muted-foreground">
                  {assets?.length === 0
                    ? "Get started by uploading files or adding links to your project."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
              {assets?.length === 0 && (
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
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
            <AssetGrid assets={filteredAssets} onDelete={handleDeleteAsset} />
          ) : (
            <AssetList assets={filteredAssets} onDelete={handleDeleteAsset} />
          )}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
