"use client";

import { useState } from "react";
import { Node } from "reactflow";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  X,
  Brain,
  Wand2,
  Layers,
  Copy,
  Check,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { Project, FlowNode } from "@/lib/types";
import { generatePRD, generateImplementationPrompt } from "@/lib/ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Id } from "@workspace/backend";
import { LibraryManager } from "./library-manager";
import { PromptGenerator } from "./prompt-generator";
import { FeatureSelector } from "@/components/ui/selectors/feature-selector";
import { useSession } from "@/context/session-context";

interface NodeDetailsPanelProps {
  node: Node;
  project: Project;
  onClose: () => void;
  onUpdate: (node: Node) => void;
  onDelete?: (nodeId: string) => void;
  onManageSubFlow?: () => void;
}

export function NodeDetailsPanel({
  node,
  project,
  onClose,
  onUpdate,
  onDelete,
  onManageSubFlow,
}: NodeDetailsPanelProps) {
  const { token } = useSession();
  const [formData, setFormData] = useState({
    label: node.data.label || "",
    description: node.data.description || "",
    priority: node.data.priority || "medium",
    featureId: node.data.featureId || null,
  });
  const [generatingPRD, setGeneratingPRD] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [copiedPRD, setCopiedPRD] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showLibraryManager, setShowLibraryManager] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [showComponentManager, setShowComponentManager] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch existing PRD and implementation prompt
  const existingPRD = useQuery(api.prds.getByNode, {
    projectId: project._id as Id<"projects">,
    nodeId: node.id,
    token,
  });
  const existingPrompt = useQuery(api.implementationPrompts.getByNode, {
    projectId: project._id as Id<"projects">,
    nodeId: node.id,
    token,
  });

  // Fetch libraries for this node
  const nodeLibraries = useQuery(api.libraryDependencies.getLibrariesByNode, {
    projectId: project._id as Id<"projects">,
    nodeId: node.id,
    token,
  });

  // Mutations
  const createPRD = useMutation(api.prds.create);
  const updatePRD = useMutation(api.prds.update);
  const createPrompt = useMutation(api.implementationPrompts.create);
  const updatePrompt = useMutation(api.implementationPrompts.update);

  const handleUpdate = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        ...formData,
      },
    };
    onUpdate(updatedNode);
  };

  const handleGeneratePRD = async () => {
    setGeneratingPRD(true);
    try {
      const connectedNodes =
        project.flowData?.edges
          ?.filter((edge) => edge.source === node.id || edge.target === node.id)
          .map((edge) => {
            const connectedNodeId =
              edge.source === node.id ? edge.target : edge.source;
            const connectedNode = project.flowData?.nodes?.find(
              (n) => n.id === connectedNodeId
            );
            return connectedNode
              ? {
                  type: connectedNode.data.type,
                  label: connectedNode.data.label,
                }
              : null;
          })
          .filter(
            (node): node is { type: FlowNode["data"]["type"]; label: string } =>
              node !== null
          ) || [];

      const generatedContent = await generatePRD({
        type: node.data.type,
        label: formData.label,
        description: formData.description,
        techStack: project.techStack,
        connectedNodes,
        platform: project.platform,
      });

      const title = `${formData.label} - PRD`;

      if (existingPRD) {
        await updatePRD({
          id: existingPRD._id,
          content: generatedContent,
          title,
          token,
        });
      } else {
        await createPRD({
          projectId: project._id as Id<"projects">,
          nodeId: node.id,
          title,
          content: generatedContent,
          token,
        });
      }

      toast.success("PRD generated successfully!");
    } catch (error) {
      toast.error("Failed to generate PRD");
      console.error(error);
    } finally {
      setGeneratingPRD(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!existingPRD) {
      toast.error("Please generate a PRD first");
      return;
    }

    setGeneratingPrompt(true);
    try {
      const connectedNodes =
        project.flowData?.edges
          ?.filter((edge) => edge.source === node.id || edge.target === node.id)
          .map((edge) => {
            const connectedNodeId =
              edge.source === node.id ? edge.target : edge.source;
            const connectedNode = project.flowData?.nodes?.find(
              (n) => n.id === connectedNodeId
            );
            return connectedNode
              ? {
                  type: connectedNode.data.type,
                  label: connectedNode.data.label,
                }
              : null;
          })
          .filter(
            (node): node is { type: FlowNode["data"]["type"]; label: string } =>
              node !== null
          ) || [];

      const generatedContent = await generateImplementationPrompt(
        {
          type: node.data.type,
          label: formData.label,
          description: formData.description,
          techStack: project.techStack,
          connectedNodes,
          platform: project.platform,
        },
        existingPRD.content
      );

      const title = `${formData.label} - Implementation Guide`;

      if (existingPrompt) {
        await updatePrompt({
          id: existingPrompt._id,
          content: generatedContent,
          title,
          token,
        });
      } else {
        await createPrompt({
          projectId: project._id as Id<"projects">,
          nodeId: node.id,
          prdId: existingPRD._id,
          title,
          content: generatedContent,
          techStack: project.techStack,
          token,
        });
      }

      toast.success("Implementation prompt generated!");
    } catch (error) {
      toast.error("Failed to generate implementation prompt");
      console.error(error);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleCopyPRD = async () => {
    if (!existingPRD) return;
    try {
      await navigator.clipboard.writeText(existingPRD.content);
      setCopiedPRD(true);
      toast.success("PRD copied to clipboard!");
      setTimeout(() => setCopiedPRD(false), 2000);
    } catch (error) {
      toast.error("Failed to copy PRD");
    }
  };

  const handleCopyPrompt = async () => {
    if (!existingPrompt) return;
    try {
      await navigator.clipboard.writeText(existingPrompt.content);
      setCopiedPrompt(true);
      toast.success("Implementation prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      toast.error("Failed to copy implementation prompt");
    }
  };

  const handleDeleteNode = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${node.data.label}"? This will also delete all connected edges.`
    );

    if (confirmDelete && onDelete) {
      onDelete(node.id);
      onClose();
    }
  };

  // Show library manager or prompt generator if requested
  if (showLibraryManager) {
    return (
      <LibraryManager
        project={project}
        nodeId={node.id}
        onClose={() => setShowLibraryManager(false)}
      />
    );
  }
  if (showPromptGenerator) {
    return (
      <PromptGenerator
        project={project}
        nodeId={node.id}
        onClose={() => setShowPromptGenerator(false)}
      />
    );
  }

  // Minimal tab navigation
  const tabItems = [
    { value: "details", label: "Details" },
    { value: "docs", label: "Docs", count: existingPRD ? 1 : undefined },
  ];

  return (
    <div className="w-96 h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/10">
        <span className="font-semibold text-base">Node Details</span>
        <div className="flex items-center gap-1">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteNode}
              className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete Node"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex gap-2 px-4 pt-2 pb-1 border-b border-muted-foreground/10">
        {tabItems.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            size="sm"
            className="rounded-full px-3 text-sm font-medium relative"
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-xs bg-muted px-1 rounded-full text-muted-foreground absolute -top-2 -right-2">
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>
      {/* Main Content */}
      <ScrollArea className="flex-1 px-4 py-2">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            title="Manage Libraries"
            onClick={() => setShowLibraryManager(true)}
            className="rounded-full"
          >
            <Package className="w-4 h-4" />
            {nodeLibraries && nodeLibraries.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {nodeLibraries.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Generate Prompts"
            onClick={() => setShowPromptGenerator(true)}
            className="rounded-full"
          >
            <Wand2 className="w-4 h-4" />
          </Button>

          {onManageSubFlow && node.data.hasSubFlow && (
            <Button
              variant="outline"
              size="sm"
              title="Manage Sub-Flow"
              onClick={onManageSubFlow}
              className="rounded-full"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="sr-only">Sub-Flow</span>
            </Button>
          )}
        </div>
        {/* Sub-Flow Inline Badge */}
        {node.data.hasSubFlow && (
          <div className="flex items-center gap-2 mb-4 text-xs text-blue-700">
            <Layers className="w-3 h-3 text-blue-600" />
            <span className="font-medium">Has Sub-Flow</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {node.data.subFlowData?.nodes?.length || 0} nodes
            </Badge>
            <span className="text-blue-500">/</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {node.data.subFlowData?.edges?.length || 0} connections
            </Badge>
          </div>
        )}
        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Feature name"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this feature..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="w-full border rounded px-2 py-1 text-sm bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {node.data.type === "feature" && (
              <div className="space-y-2">
                <Label htmlFor="featureId">Linked Feature</Label>
                <FeatureSelector
                  projectId={project._id}
                  selectedFeatureId={formData.featureId}
                  onChange={(featureId) =>
                    setFormData({ ...formData, featureId })
                  }
                />
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button onClick={handleUpdate} className="flex-1">
                Update Node
              </Button>
              {onManageSubFlow && (
                <Button
                  variant="outline"
                  onClick={onManageSubFlow}
                  className="flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Sub-Flow
                </Button>
              )}
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div className="space-y-4 mt-2">
            <div className="flex gap-2 border-b border-muted-foreground/10 pb-2">
              <Button
                variant={activeTab === "docs" ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-3 text-sm font-medium"
                onClick={() => setActiveTab("docs")}
              >
                PRD
              </Button>
              <Button
                variant={activeTab === "docs" ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-3 text-sm font-medium"
                onClick={() => setActiveTab("docs")}
              >
                Implementation
              </Button>
            </div>
            {/* PRD Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Brain className="w-4 h-4" /> Product Requirements Document
                </span>
                <div className="flex gap-2">
                  {existingPRD && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPRD}
                      disabled={copiedPRD}
                    >
                      {copiedPRD ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleGeneratePRD}
                    disabled={generatingPRD}
                  >
                    {generatingPRD
                      ? "Generating..."
                      : existingPRD
                        ? "Regenerate"
                        : "Generate"}
                  </Button>
                </div>
              </div>
              <div>
                {existingPRD ? (
                  <ScrollArea className="h-64 w-full">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {existingPRD.content}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-64 flex items-center justify-center text-center">
                    <div>
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Click Generate to create an AI-powered PRD based on your
                        project context
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Implementation Section */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Wand2 className="w-4 h-4" /> Implementation Guide
                </span>
                <div className="flex gap-2">
                  {existingPrompt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPrompt}
                      disabled={copiedPrompt}
                    >
                      {copiedPrompt ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleGeneratePrompt}
                    disabled={generatingPrompt || !existingPRD}
                  >
                    {generatingPrompt
                      ? "Generating..."
                      : existingPrompt
                        ? "Regenerate"
                        : "Generate"}
                  </Button>
                </div>
              </div>
              <div>
                {existingPrompt ? (
                  <ScrollArea className="h-64 w-full">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {existingPrompt.content}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-64 flex items-center justify-center text-center">
                    <div>
                      <Wand2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {existingPRD
                          ? "Generate an implementation guide for AI coding assistants"
                          : "Generate a PRD first, then create an implementation guide"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
