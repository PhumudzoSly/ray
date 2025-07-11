"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Layers,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { FlowNode } from "@/lib/types";

interface SubFlowManagerProps {
  node: FlowNode;
  onUpdateNode: (node: FlowNode) => void;
  onClose: () => void;
}

export function SubFlowManager({
  node,
  onUpdateNode,
  onClose,
}: SubFlowManagerProps) {
  const [hasSubFlow, setHasSubFlow] = useState(node.data.hasSubFlow || false);
  const [subFlowNodes, setSubFlowNodes] = useState(
    node.data.subFlowData?.nodes || []
  );
  const [subFlowEdges, setSubFlowEdges] = useState(
    node.data.subFlowData?.edges || []
  );

  const handleCreateSubFlow = () => {
    setHasSubFlow(true);
    // Create a basic sub-flow structure
    const defaultNodes = [
      {
        id: `${node.id}-start`,
        type: "flowNode" as const,
        position: { x: 100, y: 100 },
        data: {
          type: "custom" as const,
          label: "Start",
          description: "Entry point for this sub-flow",
          priority: "medium" as const,
        },
      },
      {
        id: `${node.id}-end`,
        type: "flowNode" as const,
        position: { x: 300, y: 100 },
        data: {
          type: "custom" as const,
          label: "End",
          description: "Exit point for this sub-flow",
          priority: "medium" as const,
        },
      },
    ];

    const defaultEdges = [
      {
        id: `${node.id}-start-end`,
        source: `${node.id}-start`,
        target: `${node.id}-end`,
        type: "step",
      },
    ];

    setSubFlowNodes(defaultNodes);
    setSubFlowEdges(defaultEdges);
  };

  const handleSaveSubFlow = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        hasSubFlow,
        subFlowData: hasSubFlow
          ? {
              nodes: subFlowNodes,
              edges: subFlowEdges,
            }
          : undefined,
      },
    };
    onUpdateNode(updatedNode);
    onClose();
  };

  const handleDeleteSubFlow = () => {
    setHasSubFlow(false);
    setSubFlowNodes([]);
    setSubFlowEdges([]);
  };

  return (
    <div className="w-96 border-l bg-background h-full overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Sub-Flow Manager
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Parent Node</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{node.data.type}</Badge>
                <span className="font-medium">{node.data.label}</span>
              </div>
              {node.data.description && (
                <p className="text-sm text-muted-foreground">
                  {node.data.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sub-Flow Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!hasSubFlow ? (
                  <div className="text-center py-6">
                    <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Sub-Flow</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      This node doesn't have a detailed sub-flow yet. Create one
                      to break down this feature into smaller, manageable steps.
                    </p>
                    <Button onClick={handleCreateSubFlow}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Sub-Flow
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sub-Flow Active</h4>
                        <p className="text-sm text-muted-foreground">
                          {subFlowNodes.length} nodes, {subFlowEdges.length}{" "}
                          connections
                        </p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveSubFlow}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteSubFlow}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Sub-Flow
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasSubFlow && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sub-Flow Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Break complex features into manageable steps</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Detailed implementation planning</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Better team collaboration and understanding</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Easier testing and validation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            {hasSubFlow ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sub-Flow Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        Nodes ({subFlowNodes.length})
                      </h4>
                      <div className="space-y-2">
                        {subFlowNodes.map((subNode) => (
                          <div
                            key={subNode.id}
                            className="flex items-center gap-2 p-2 bg-muted rounded"
                          >
                            <Badge variant="outline" className="text-xs">
                              {subNode.data.type}
                            </Badge>
                            <span className="text-sm">
                              {subNode.data.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Connections ({subFlowEdges.length})
                      </h4>
                      <div className="space-y-2">
                        {subFlowEdges.map((edge) => {
                          const sourceNode = subFlowNodes.find(
                            (n) => n.id === edge.source
                          );
                          const targetNode = subFlowNodes.find(
                            (n) => n.id === edge.target
                          );
                          return (
                            <div
                              key={edge.id}
                              className="text-sm text-muted-foreground p-2 bg-muted rounded"
                            >
                              {sourceNode?.data.label} →{" "}
                              {targetNode?.data.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button onClick={handleSaveSubFlow} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Sub-Flow Structure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Create a sub-flow first to view its structure
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
