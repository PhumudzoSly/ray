"use client";
import React, { useState, useCallback } from "react";
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
import { UploadDropzone, useUploadThing } from "@/lib/uploadthing";

interface AssetUploadDialogProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

interface UploadedFileData {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
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
  { value: "ui_design", label: "UI Design" },
  { value: "mockups", label: "Mockups" },
  { value: "documentation", label: "Documentation" },
  { value: "inspiration", label: "Inspiration" },
  { value: "code_snippets", label: "Code Snippets" },
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
  const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  // UploadThing hook for better control
  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(
    "fileUpload",
    {
      onClientUploadComplete: (files) => {
        console.log("Upload complete:", files);
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file || !file.url) return;

        // Store the uploaded file data
        const uploadedFileData: UploadedFileData = {
          key: file.key || "",
          name: file.name || "Unknown file",
          size: file.size || 0,
          type: file.type || "application/octet-stream",
          url: file.url,
        };

        setUploadedFile(uploadedFileData);
        setUploadProgress(100);
        setIsUploadingFile(false);

        // Create a mock File object for type detection
        const mockFile = {
          name: file.name || "Unknown file",
          type: file.type || "application/octet-stream",
          size: file.size || 0,
        } as File;

        // Set the selected file for metadata editing
        setSelectedFile(mockFile);

        // Auto-detect file type if not set
        if (!assetType) {
          const detectedType = getFileType(mockFile);
          setAssetType(detectedType);
        }

        // Set asset name if not set
        if (!assetName) {
          setAssetName(file.name || "Unknown file");
        }

        toast.success("File uploaded successfully!");
      },
      onUploadError: (error) => {
        console.error("Upload error:", error);
        toast.error(error.message);
        setIsUploadingFile(false);
        setUploadProgress(0);
      },
      onUploadProgress: (progress) => {
        console.log("Upload progress:", progress);
        setUploadProgress(progress);
      },
    }
  );

  // Custom file upload handler
  const handleFileUpload = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    try {
      setIsUploadingFile(true);
      setUploadProgress(0);
      toast.info("Upload started...");

      const uploadedFiles = await startUpload([file]);
      console.log("Uploaded files:", uploadedFiles);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
      setIsUploadingFile(false);
      setUploadProgress(0);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setUploadedFile(null);
      setAssetType("");
      setAssetCategory("");
      setAssetName("");
      setAssetDescription("");
      setAssetTags([]);
      setTagInput("");
      setDragActive(false);
      setUploadProgress(0);
      setIsUploadingFile(false);
    }
  }, [open]);

  // Mutations
  const queryClient = useQueryClient();
  const createFileAssetMutation = useMutation({
    mutationFn: (args: Parameters<typeof assetActions.createFileAsset>[0]) =>
      assetActions.createFileAsset(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectAssets", projectId] });
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

  const handleSaveAsset = async () => {
    if (!uploadedFile || !assetName.trim()) return;

    try {
      setIsUploading(true);
      await createFileAssetMutation.mutateAsync({
        projectId,
        name: assetName,
        description: assetDescription,
        url: uploadedFile.url,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.type,
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
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = uploadedFile && assetName.trim() && !isUploading;

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

            {/* Custom File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                accept="image/*,video/*,audio/*,application/pdf,text/*,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.html,.css,.scss,.json,.xml,.yaml,.yml,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.psd,.ai,.indd,.sketch,.fig,.xd,.afdesign"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    Images, documents, videos, and code files up to 32MB
                  </p>
                </div>
              </label>
            </div>

            {/* Upload Progress Indicator */}
            {isUploadingFile && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upload Success Indicator */}
          {uploadedFile && !isUploadingFile && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">
                File uploaded successfully: {uploadedFile.name}
              </span>
            </div>
          )}

          {/* Asset Metadata */}
          {uploadedFile && (
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
          <Button onClick={handleSaveAsset} disabled={!canUpload}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Asset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
