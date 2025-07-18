"use client";
import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as fileActions from "@/actions/files";
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
import {
  Upload,
  X,
  File,
  Image,
  Video,
  Code,
  Palette,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "@/lib/uploadthing";

interface AssetUploadDialogProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  code: [
    "text/plain",
    "application/json",
    "text/javascript",
    "text/css",
    "text/html",
    "application/xml",
  ],
  design: [
    "application/x-photoshop",
    "application/x-illustrator",
    "application/x-indesign",
  ],
  other: ["*/*"],
};

const ASSET_TYPES = [
  { value: "image", label: "Image", icon: Image },
  { value: "document", label: "Document", icon: File },
  { value: "video", label: "Video", icon: Video },
  { value: "code", label: "Code", icon: Code },
  { value: "design", label: "Design", icon: Palette },
  { value: "other", label: "Other", icon: File },
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

export function AssetUploadDialog({
  projectId,
  onClose,
  onSuccess,
  open,
}: AssetUploadDialogProps) {
  const { token } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<string>("");
  const [assetCategory, setAssetCategory] = useState<string>("");
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetTags, setAssetTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setAssetType("");
      setAssetCategory("");
      setAssetName("");
      setAssetDescription("");
      setAssetTags([]);
      setTagInput("");
      setDragActive(false);
    }
  }, [open]);

  // Mutations
  const queryClient = useQueryClient();
  const generateUploadUrlMutation = useMutation({
    mutationFn: async (args) => fileActions.generateUploadUrl(args),
  });
  const saveFileMutation = useMutation({
    mutationFn: async (args) => fileActions.saveFile(args),
  });
  const createFileAssetMutation = useMutation({
    mutationFn: async (args) => assetActions.createFileAsset(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  const getFileType = (file: File): string => {
    // First try MIME type detection
    if (ALLOWED_TYPES.image.includes(file.type)) return "image";
    if (ALLOWED_TYPES.document.includes(file.type)) return "document";
    if (ALLOWED_TYPES.video.includes(file.type)) return "video";
    if (ALLOWED_TYPES.code.includes(file.type)) return "code";
    if (ALLOWED_TYPES.design.includes(file.type)) return "design";

    // Fallback to file extension detection
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension) return "other";

    // Image extensions
    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "bmp",
        "ico",
        "tiff",
      ].includes(extension)
    ) {
      return "image";
    }

    // Document extensions
    if (
      ["pdf", "doc", "docx", "txt", "rtf", "odt", "pages"].includes(extension)
    ) {
      return "document";
    }

    // Video extensions
    if (
      ["mp4", "webm", "ogg", "mov", "avi", "mkv", "wmv", "flv"].includes(
        extension
      )
    ) {
      return "video";
    }

    // Code extensions
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "scss",
        "sass",
        "json",
        "xml",
        "yaml",
        "yml",
        "md",
        "py",
        "java",
        "cpp",
        "c",
        "php",
        "rb",
        "go",
        "rs",
        "swift",
        "kt",
      ].includes(extension)
    ) {
      return "code";
    }

    // Design extensions
    if (
      ["psd", "ai", "indd", "sketch", "fig", "xd", "afdesign"].includes(
        extension
      )
    ) {
      return "design";
    }

    return "other";
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File size exceeds 50MB limit" };
    }

    const fileType = getFileType(file);
    if (fileType === "other" && !ALLOWED_TYPES.other.includes("*/*")) {
      return { valid: false, error: "File type not supported" };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    setAssetType(getFileType(file));
    setAssetName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for name
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
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

  // Remove old upload logic and use UploadThing
  const handleUploadComplete = async (files: any[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      await createFileAssetMutation.mutateAsync({
        projectId,
        name: assetName || file.name,
        description: assetDescription,
        url: file.url, // UploadThing file URL
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        type: assetType as any,
        category: assetCategory || "other",
        tags: assetTags.length > 0 ? assetTags : undefined,
      });
      toast.success("Asset uploaded successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload asset");
    }
  };

  const canUpload = selectedFile && assetName.trim() && !isUploading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Asset</DialogTitle>
          <DialogDescription>
            Upload files to your project. Supported formats include images,
            documents, videos, and code files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>File</Label>
            <UploadDropzone
              endpoint="fileUpload"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error) => toast.error(error.message)}
            />
          </div>

          {/* Asset Metadata */}
          {selectedFile && (
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
                  <Label htmlFor="asset-type">Type</Label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger>
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
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-category">Category</Label>
                  <Select
                    value={assetCategory}
                    onValueChange={setAssetCategory}
                  >
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!canUpload}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
