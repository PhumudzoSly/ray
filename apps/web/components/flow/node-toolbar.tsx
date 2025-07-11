"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { nodeTypes } from "@/lib/types";
import * as LucideIcons from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";
import { Plus, Package, Search, X, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface NodeToolbarProps {
  onAddNode: (type: string) => void;
}

export function NodeToolbar({ onAddNode }: NodeToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Group node types by category
  const coreNodes = nodeTypes.filter((node) =>
    [
      "auth",
      "onboarding",
      "feature",
      "feedback",
      "error",
      "settings",
      "permissions",
      "custom",
    ].includes(node.type)
  );

  const dataNodes = nodeTypes.filter((node) =>
    ["database", "storage", "caching", "search"].includes(node.type)
  );

  const integrationNodes = nodeTypes.filter((node) =>
    [
      "api",
      "payment",
      "notification",
      "analytics",
      "integration",
      "email",
      "sms",
    ].includes(node.type)
  );

  const securityNodes = nodeTypes.filter((node) =>
    ["security"].includes(node.type)
  );

  const flowNodes = nodeTypes.filter((node) =>
    ["start", "end", "conditional", "group", "stickyNote"].includes(node.type)
  );

  // Helper function to get icon component with fallback
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return LucideIcons.Package;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Package;
  };

  // Filter nodes based on search term
  const filterNodes = (nodes: typeof nodeTypes) => {
    if (!searchTerm) return nodes;
    return nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderNodeGrid = (nodes: typeof nodeTypes) => {
    const filteredNodes = filterNodes(nodes);

    if (filteredNodes.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No nodes found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        {filteredNodes.map((nodeType) => {
          const IconComponent = getIconComponent(nodeType.icon);
          return (
            <Button
              key={nodeType.type}
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddNode(nodeType.type);
                setSearchTerm("");
              }}
              className="justify-start gap-3 h-auto p-3 hover:bg-accent/50 transition-all duration-200 group"
            >
              <div
                className={cn(
                  "p-2 rounded-md",
                  nodeType.color || "bg-primary/80",
                  "shadow-sm group-hover:scale-110 transition-transform duration-200"
                )}
              >
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{nodeType.label}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {nodeType.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="absolute top-[72px] left-4 z-10">
      <TooltipProvider delayDuration={300}>
        {!isOpen ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="sm"
                className="shadow-md hover:shadow-lg transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Open node picker</TooltipContent>
          </Tooltip>
        ) : (
          <Card
            className={cn(
              "p-0 bg-background/95 backdrop-blur-md w-[360px] shadow-lg border rounded-lg",
              "animate-in slide-in-from-left-2 duration-300",
              isMinimized && "h-[40px] overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              {isMinimized ? (
                <div className="flex items-center gap-2 flex-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Add Nodes</span>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium">Add Node</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose a component for your flow
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-7 w-7 p-0 hover:bg-accent rounded-full"
                >
                  <ChevronUp
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isMinimized && "rotate-180"
                    )}
                  />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    setSearchTerm("");
                  }}
                  className="h-7 w-7 p-0 hover:bg-accent rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search nodes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <div className="p-3">
                  <Tabs defaultValue="flow" className="w-full">
                    <TabsList className="grid grid-cols-5 mb-3 bg-muted/30">
                      <TabsTrigger value="flow" className="text-xs">
                        Flow
                      </TabsTrigger>
                      <TabsTrigger value="core" className="text-xs">
                        Core
                      </TabsTrigger>
                      <TabsTrigger value="data" className="text-xs">
                        Data
                      </TabsTrigger>
                      <TabsTrigger value="integration" className="text-xs">
                        API
                      </TabsTrigger>
                      <TabsTrigger value="security" className="text-xs">
                        Security
                      </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[320px] pr-2">
                      <TabsContent value="flow" className="mt-0">
                        {renderNodeGrid(flowNodes)}
                      </TabsContent>

                      <TabsContent value="core" className="mt-0">
                        {renderNodeGrid(coreNodes)}
                      </TabsContent>

                      <TabsContent value="data" className="mt-0">
                        {renderNodeGrid(dataNodes)}
                      </TabsContent>

                      <TabsContent value="integration" className="mt-0">
                        {renderNodeGrid(integrationNodes)}
                      </TabsContent>

                      <TabsContent value="security" className="mt-0">
                        {renderNodeGrid(securityNodes)}
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </div>
              </>
            )}
          </Card>
        )}
      </TooltipProvider>
    </div>
  );
}
