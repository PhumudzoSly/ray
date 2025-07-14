"use client";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  File,
  Image,
  Video,
  Code,
  Link,
  Palette,
  Calendar,
  User,
  Tag,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: any;
  onDelete: (assetId: string) => void;
  onUpdate?: (assetId: string) => void;
  className?: string;
}

const ASSET_TYPE_ICONS = {
  image: Image,
  document: File,
  video: Video,
  link: Link,
  code: Code,
  design: Palette,
  other: File,
};

const ASSET_TYPE_COLORS = {
  image: "text-green-600 bg-green-100 dark:bg-green-900/20",
  document: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  video: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  link: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
  code: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20",
  design: "text-pink-600 bg-pink-100 dark:bg-pink-900/20",
  other: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
};

const LINK_TYPE_ICONS = {
  youtube: "🎥",
  figma: "🎨",
  github: "💻",
  notion: "📝",
  dribbble: "🎨",
  behance: "🎨",
  external: "🔗",
};

export function AssetCard({
  asset,
  onDelete,
  onUpdate,
  className,
}: AssetCardProps) {
  const { token } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);

  // Mutations
  const getDownloadUrl = useMutation(api.assets.getAssetDownloadUrl);
  const incrementViewCount = useMutation(api.assets.incrementViewCount);

  const TypeIcon =
    ASSET_TYPE_ICONS[asset.type as keyof typeof ASSET_TYPE_ICONS] || File;
  const typeColor =
    ASSET_TYPE_COLORS[asset.type as keyof typeof ASSET_TYPE_COLORS] ||
    ASSET_TYPE_COLORS.other;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handlePreview = async () => {
    if (asset.type === "link") {
      window.open(asset.url, "_blank");
    } else {
      // For file assets, open in a new tab using the storage URL
      if (asset.storageId) {
        const fileUrl = `https://${process.env.NEXT_PUBLIC_CONVEX_URL?.replace("https://", "")}/api/storage/${asset.storageId}`;
        window.open(fileUrl, "_blank");
      }

      // Increment view count
      if (token) {
        try {
          await incrementViewCount({
            token: token,
            assetId: asset._id,
          });
        } catch (error) {
          console.error("Failed to increment view count:", error);
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!token || asset.type === "link") return;

    setIsDownloading(true);
    try {
      const downloadUrl = await getDownloadUrl({
        token: token,
        assetId: asset._id,
      });

      if (downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = asset.fileName || asset.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Download started");
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    onDelete(asset._id);
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(asset._id);
    }
  };

  const renderPreview = () => {
    if (asset.type === "image" && asset.storageId) {
      return (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={`https://${process.env.NEXT_PUBLIC_CONVEX_URL?.replace("https://", "")}/api/storage/${asset.storageId}`}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (asset.type === "link") {
      const linkIcon =
        LINK_TYPE_ICONS[asset.linkType as keyof typeof LINK_TYPE_ICONS] ||
        LINK_TYPE_ICONS.external;
      return (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">{linkIcon}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <TypeIcon className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Preview */}
        <div className="relative mb-4">
          {renderPreview()}

          {/* Overlay Actions */}
          <div className="absolute px-1.5 inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
            <Button
              size="xs"
              variant="secondary"
              onClick={handlePreview}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Eye className="w-4 h-4 mr-1" />
              {asset.type === "link" ? "Open" : "Preview"}
            </Button>

            {asset.type !== "link" && (
              <Button
                size="xs"
                variant="secondary"
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-white/90 hover:bg-white text-black"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-medium text-sm line-clamp-1 whitespace-pre-wrap truncate"
                title={asset.name}
              >
                {asset.name}
              </h3>
              {asset.description && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap  line-clamp-2 mt-1">
                  {asset.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  {asset.type === "link" ? "Open Link" : "Preview"}
                </DropdownMenuItem>
                {asset.type !== "link" && (
                  <DropdownMenuItem
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleUpdate}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            {/* Type and Category */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", typeColor)}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {asset.type}
              </Badge>
              {asset.category && (
                <Badge variant="secondary" className="text-xs">
                  {asset.category}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{asset.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* File Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {asset.fileSize && (
                  <span>{formatFileSize(asset.fileSize)}</span>
                )}
                <span>{formatDate(asset.uploadedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                {asset.viewCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {asset.viewCount}
                  </span>
                )}
                {asset.downloadCount !== undefined && asset.type !== "link" && (
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {asset.downloadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Uploader */}
            {asset.uploadedByUser && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={asset.uploadedByUser.image} />
                  <AvatarFallback className="text-xs">
                    {asset.uploadedByUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{asset.uploadedByUser.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
