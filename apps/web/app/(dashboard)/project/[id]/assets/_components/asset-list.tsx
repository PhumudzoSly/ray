"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as assetActions from "@/actions/project/assets";
import { useSession } from "@/context/session-context";
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

interface AssetListProps {
  assets: any[];
  onDelete: (assetId: string) => void;
  onUpdate?: (assetId: string) => void;
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

export function AssetList({ assets, onDelete, onUpdate }: AssetListProps) {
  const { token } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);
  const queryClient = useQueryClient();

  // Mutations
  const incrementViewMutation = useMutation({
    mutationFn: ({ assetId }: { assetId: string }) =>
      assetActions.incrementViewCount({ assetId, ipAddress: "0.0.0.0" }),
    onError: (error) => {
      console.error("Failed to increment view count:", error);
    },
  });

  const downloadUrlMutation = useMutation({
    mutationFn: ({ assetId }: { assetId: string }) =>
      assetActions.getAssetDownloadUrl({ assetId }),
    onError: (error) => {
      console.error("Failed to get download URL:", error);
      toast.error("Failed to get download URL");
    },
  });

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

  const handlePreview = async (asset: any) => {
    if (asset.type === "link") {
      window.open(asset.url, "_blank");
    } else {
      // For file assets, open in a new tab using the storage URL
      if (asset.storageId) {
        const fileUrl = `/api/storage/${asset.storageId}`;
        window.open(fileUrl, "_blank");
      }

      // Increment view count
      if (token) {
        incrementViewMutation.mutate({ assetId: asset.id });
      }
    }
  };

  const handleDownload = async (asset: any) => {
    if (!token || asset.type === "link") return;

    setIsDownloading(true);
    try {
      const downloadUrl = await downloadUrlMutation.mutateAsync({
        assetId: asset.id,
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

  const getAssetIcon = (asset: any) => {
    if (asset.type === "link") {
      const linkIcon =
        LINK_TYPE_ICONS[asset.linkType as keyof typeof LINK_TYPE_ICONS] ||
        LINK_TYPE_ICONS.external;
      return <span className="text-2xl">{linkIcon}</span>;
    }

    const TypeIcon =
      ASSET_TYPE_ICONS[asset.type as keyof typeof ASSET_TYPE_ICONS] || File;
    return <TypeIcon className="w-6 h-6" />;
  };

  return (
    <div className="space-y-2">
      {assets.map((asset) => {
        const TypeIcon =
          ASSET_TYPE_ICONS[asset.type as keyof typeof ASSET_TYPE_ICONS] || File;
        const typeColor =
          ASSET_TYPE_COLORS[asset.type as keyof typeof ASSET_TYPE_COLORS] ||
          ASSET_TYPE_COLORS.other;

        return (
          <div
            key={asset.id}
            className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow group"
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              {getAssetIcon(asset)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate" title={asset.name}>
                    {asset.name}
                  </h3>
                  {asset.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {asset.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreview(asset)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {asset.type !== "link" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(asset)}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(asset)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {asset.type === "link" ? "Open Link" : "Preview"}
                      </DropdownMenuItem>
                      {asset.type !== "link" && (
                        <DropdownMenuItem
                          onClick={() => handleDownload(asset)}
                          disabled={isDownloading}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onUpdate?.(asset.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(asset.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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

                {/* File Info */}
                <div className="flex items-center gap-4">
                  {asset.fileSize && (
                    <span className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {formatFileSize(asset.fileSize)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(asset.uploadedAt)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  {asset.viewCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {asset.viewCount}
                    </span>
                  )}
                  {asset.downloadCount !== undefined &&
                    asset.type !== "link" && (
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {asset.downloadCount}
                      </span>
                    )}
                </div>

                {/* Uploader */}
                {asset.uploadedByUser && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={asset.uploadedByUser.image} />
                      <AvatarFallback className="text-xs">
                        {asset.uploadedByUser.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{asset.uploadedByUser.name}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {asset.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
