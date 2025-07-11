"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ConnectionMode,
  MarkerType,
  Panel,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Project, FlowNode } from "@/lib/types";
import { nodeTypeComponents } from "./nodes";
import { NodeToolbar } from "./node-toolbar";
import { NodeDetailsPanel } from "./node-details-panel";
import { MissingFlowDetector } from "./missing-flow-detector";
import { FlowBreadcrumb } from "./flow-breadcrumb";
import { SubFlowManager } from "./sub-flow-manager";
import { Button } from "@workspace/ui/components/button";
import {
  Brain,
  Layers,
  ArrowLeft,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Save,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from "@workspace/ui/components/sheet";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useSession } from "@/context/session-context";

const nodeTypes = nodeTypeComponents;

// Auto-layout helper function
const getAutoLayoutPosition = (index: number, totalNodes: number) => {
  const GRID_SIZE = 200;
  const COLS = Math.ceil(Math.sqrt(totalNodes));

  const col = index % COLS;
  const row = Math.floor(index / COLS);

  return {
    x: col * GRID_SIZE + 50,
    y: row * GRID_SIZE + 50,
  };
};

interface FlowEditorProps {
  project: Project;
}

// Helper to sanitize edge styles for Convex schema
function sanitizeEdgeStyles(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    style: edge.style
      ? {
          ...(edge.style.stroke !== undefined && { stroke: edge.style.stroke }),
          ...(edge.style.strokeWidth !== undefined && {
            strokeWidth: edge.style.strokeWidth,
          }),
        }
      : undefined,
  }));
}

export function FlowEditor({ project }: FlowEditorProps) {
  const { token } = useSession();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSubFlowManager, setShowSubFlowManager] = useState(false);

  // Flow view settings
  const [miniMapVisible, setMiniMapVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sub-flow navigation state
  const [currentFlowId, setCurrentFlowId] = useState<Id<"flows"> | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{
      id: string;
      label: string;
      isSubFlow: boolean;
    }>
  >([]);

  // Get main flow
  const mainFlow = useQuery(api.flows.getMainFlow, {
    projectId: project._id as Id<"projects">,
    token,
  });

  // Get current flow data (main or sub-flow)
  const currentFlowData = useQuery(
    api.flows.getCompleteFlowData,
    currentFlowId ? { flowId: currentFlowId, token } : "skip"
  );

  // Use main flow if no specific flow is selected
  const displayFlowData = currentFlowData || project.flowData;

  const [nodes, setNodes, onNodesChange] = useNodesState(
    (displayFlowData?.nodes || []) as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    displayFlowData?.edges || []
  );

  // Get React Flow utilities
  const { fitView } = useReactFlow();

  // Mutations
  const updateFlowData = useMutation(api.flows.updateFlowData);
  const createSubFlow = useMutation(api.flows.createSubFlow);
  const getSubFlow = useQuery(
    api.flows.getSubFlow,
    selectedNode?.data.hasSubFlow && selectedNode?.id
      ? {
          projectId: project._id as Id<"projects">,
          parentNodeId: selectedNode.id,
          token,
        }
      : "skip"
  );

  // useRef to store debounce timeout ID
  const edgeUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Create a ref to store the latest edges to avoid stale closure
  const edgesRef = useRef(edges);
  const nodesRef = useRef(nodes);

  // Throttled save function to prevent excessive database updates
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

  const saveToDatabase = useCallback(() => {
    if (!currentFlowId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setPendingSave(true);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateFlowData({
          flowId: currentFlowId,
          nodes: nodesRef.current,
          edges: sanitizeEdgeStyles(edgesRef.current),
          token,
        });
        setPendingSave(false);
      } catch (error) {
        console.error("Failed to save flow data:", error);
        toast.error("Failed to save changes");
        setPendingSave(false);
      }

      saveTimeoutRef.current = null;
    }, 1000);
  }, [currentFlowId, updateFlowData]);

  // Update refs when state changes
  useEffect(() => {
    edgesRef.current = edges;
    nodesRef.current = nodes;

    // Auto-save on changes
    if (currentFlowId && (nodes.length > 0 || edges.length > 0)) {
      saveToDatabase();
    }
  }, [edges, nodes, currentFlowId, saveToDatabase]);

  // Enhanced edges change handler with proper debounce
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      // Apply changes immediately for UI responsiveness
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Cleanup timeout on unmount and flow change
  useEffect(() => {
    return () => {
      if (edgeUpdateTimeoutRef.current) {
        clearTimeout(edgeUpdateTimeoutRef.current);
        edgeUpdateTimeoutRef.current = null;
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // Clear timeout when switching flows
  useEffect(() => {
    if (edgeUpdateTimeoutRef.current) {
      clearTimeout(edgeUpdateTimeoutRef.current);
      edgeUpdateTimeoutRef.current = null;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [currentFlowId]);

  // Set current flow to main flow when component mounts
  useEffect(() => {
    if (mainFlow && !currentFlowId) {
      setCurrentFlowId(mainFlow._id);
    }
  }, [mainFlow, currentFlowId]);

  // Update nodes and edges when flow data changes
  useEffect(() => {
    if (displayFlowData) {
      setNodes((displayFlowData.nodes || []) as Node[]);
      setEdges(displayFlowData.edges || []);
    }
  }, [displayFlowData, setNodes, setEdges]);

  // Listen for sub-flow navigation events
  useEffect(() => {
    const handleNavigateToSubFlow = async (event: CustomEvent) => {
      const { nodeId } = event.detail;
      const node = nodes.find((n) => n.id === nodeId);

      if (node?.data.hasSubFlow) {
        // Check if sub-flow exists, create if not
        const existingSubFlow = await getSubFlow;

        let subFlowId;
        if (existingSubFlow) {
          subFlowId = existingSubFlow._id;
        } else {
          // Create sub-flow
          subFlowId = await createSubFlow({
            projectId: project._id as Id<"projects">,
            parentNodeId: nodeId,
            name: node.data.label,
            token,
          });
        }

        setCurrentFlowId(subFlowId);
        setBreadcrumbs([
          { id: nodeId, label: node.data.label, isSubFlow: true },
        ]);
        setShowAIPanel(false);
        toast.success(`Navigated to ${node.data.label} sub-flow`);
      } else {
        toast.error("This node does not have a sub-flow");
      }
    };

    const handleUpdateNodeData = (event: CustomEvent) => {
      const { nodeId, data } = event.detail;
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    };

    window.addEventListener(
      "navigateToSubFlow",
      handleNavigateToSubFlow as unknown as EventListener
    );
    window.addEventListener(
      "updateNodeData",
      handleUpdateNodeData as unknown as EventListener
    );
    return () => {
      window.removeEventListener(
        "navigateToSubFlow",
        handleNavigateToSubFlow as unknown as EventListener
      );
      window.removeEventListener(
        "updateNodeData",
        handleUpdateNodeData as unknown as EventListener
      );
    };
  }, [nodes, createSubFlow, project._id, getSubFlow, setNodes]);

  const onConnect = useCallback(
    async (params: Connection) => {
      try {
        // Validate connection parameters
        if (!params.source || !params.target) {
          toast.error("Invalid connection: missing source or target");
          return;
        }

        // Generate a proper edge ID
        const edgeId = `${params.source}-${params.target}-${Date.now()}`;

        // Create edge with cleaner, more visible styling
        const newEdge: Edge = {
          id: edgeId,
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined,
          type: "step",
          animated: false,
          style: {
            stroke: "var(--primary)",
            strokeWidth: 2,
            cursor: "pointer",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--primary)",
            width: 15,
            height: 15,
          },
        };

        // Add edge to local state first for UI responsiveness
        setEdges((eds) => addEdge(newEdge, eds));
      } catch (error) {
        console.error("Failed to create connection:", error);
        toast.error("Failed to create connection");
      }
    },
    [setEdges]
  );

  // Add node deletion function
  const deleteNode = useCallback(
    (nodeId: string) => {
      const confirmDelete = window.confirm(
        "Do you want to delete this node? This will also delete all connected edges."
      );

      if (confirmDelete) {
        // Remove the node
        const newNodes = nodes.filter((n) => n.id !== nodeId);

        // Remove all edges connected to this node
        const newEdges = edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );

        // Update local state
        setNodes(newNodes);
        setEdges(newEdges);

        // Clear selected node if it was the deleted one
        if (selectedNode?.id === nodeId) {
          setSelectedNode(null);
        }

        toast.success("Node and connections deleted");
      }
    },
    [nodes, edges, selectedNode, setNodes, setEdges]
  );

  // Handle node click (left click only)
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle right-click for node deletion
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      deleteNode(node.id);
    },
    [deleteNode]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Show confirmation dialog or immediately delete
      const confirmDelete = window.confirm(
        "Do you want to delete this connection?"
      );

      if (confirmDelete) {
        const newEdges = edges.filter((e) => e.id !== edge.id);
        setEdges(newEdges);
        toast.success("Connection deleted");
      }
    },
    [edges, setEdges]
  );

  const addNode = useCallback(
    (type: string, label?: string, description?: string) => {
      // Use auto-layout positioning instead of random placement
      const position = getAutoLayoutPosition(nodes.length, nodes.length + 1);

      const nodeType = "flowNode";
      const baseData = {
        type,
        label: label || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: description || "",
        priority: "medium" as const,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: nodeType,
        position,
        data:
          type === "conditional" ? { ...baseData, conditions: [] } : baseData,
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes as any);

      // Focus on the new node
      setTimeout(() => {
        setSelectedNode(newNode as Node);
        fitView({ duration: 500, padding: 0.2 });
      }, 50);

      toast.success(`Added new ${type} node`);
    },
    [nodes, setNodes, fitView]
  );

  const handleNavigateToBreadcrumb = (nodeId: string | null) => {
    if (nodeId === null) {
      // Navigate to main flow
      if (mainFlow) {
        setCurrentFlowId(mainFlow._id);
        setBreadcrumbs([]);
        toast.success("Navigated to main flow");
      }
    } else {
      // Navigate to specific sub-flow
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        toast.success(`Navigated to ${node.data.label} sub-flow`);
      }
    }
    setShowAIPanel(false);
  };

  const handleUpdateNode = (updatedNode: Node) => {
    const updatedNodes = nodes.map((n) =>
      n.id === updatedNode.id ? updatedNode : n
    );
    setNodes(updatedNodes);
  };

  // Auto-layout function
  const autoLayout = useCallback(() => {
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: getAutoLayoutPosition(index, nodes.length),
    }));

    setNodes(layoutedNodes);
    toast.success("Layout organized");

    // Fit view after organizing
    setTimeout(() => {
      fitView({ duration: 500, padding: 0.1 });
    }, 50);
  }, [nodes, setNodes, fitView]);

  const isSubFlow = breadcrumbs.length > 0;

  // Save flow data explicitly (manual save)
  const handleSaveFlow = async () => {
    if (!currentFlowId) return;

    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setPendingSave(true);

    try {
      await updateFlowData({
        flowId: currentFlowId,
        nodes: nodes,
        edges: sanitizeEdgeStyles(edges),
        token,
      });
      toast.success("Flow saved successfully");
      setPendingSave(false);
    } catch (error) {
      console.error("Failed to save flow:", error);
      toast.error("Failed to save flow");
      setPendingSave(false);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen().catch((err) => console.error(err));
    } else {
      const flowContainer = document.querySelector(".flow-container");
      if (flowContainer instanceof HTMLElement) {
        flowContainer.requestFullscreen().catch((err) => console.error(err));
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected node with Delete or Backspace key
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNode
      ) {
        // Don't delete if user is typing in an input field
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true"
        ) {
          return;
        }

        event.preventDefault();
        deleteNode(selectedNode.id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNode, deleteNode]);

  const [showAISheet, setShowAISheet] = useState(false);

  return (
    <div
      className={cn(
        "flow-container flex h-[calc(100vh-78px)] bg-background",
        isFullscreen && "fixed inset-0 z-50 h-screen"
      )}
    >
      <div className="flex-1 relative">
        {/* Flow Editor Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2">
            {breadcrumbs.length > 0 ? (
              <FlowBreadcrumb
                breadcrumbs={breadcrumbs}
                onNavigate={handleNavigateToBreadcrumb}
              />
            ) : (
              <h3 className="text-sm font-medium flex items-center bg-background/80 px-3 py-1.5 rounded-md border">
                <Layers className="w-4 h-4 mr-2 opacity-60" />
                Main Flow
              </h3>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-1.5 bg-background/90 border rounded-md p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={autoLayout}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Auto Layout</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setMiniMapVisible(!miniMapVisible)}
                    >
                      <Layers className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Minimap</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fitView({ duration: 500, padding: 0.1 })}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fit View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={pendingSave ? "outline" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleSaveFlow}
                      disabled={pendingSave}
                    >
                      <Save
                        className={cn(
                          "w-4 h-4",
                          pendingSave && "animate-pulse"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {pendingSave ? "Saving..." : "Save Flow"}
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Flow Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAISheet(true)}>
                      <Brain className="w-4 h-4 mr-2 opacity-70" /> AI Tools
                    </DropdownMenuItem>

                    {isSubFlow && (
                      <DropdownMenuItem
                        onClick={() => handleNavigateToBreadcrumb(null)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 opacity-70" /> Back
                        to Main Flow
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          connectionMode={ConnectionMode.Loose}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          panOnDrag={true}
          minZoom={0.1}
          maxZoom={2}
          zoomOnScroll={true}
          zoomOnPinch={true}
          elevateNodesOnSelect={true}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          className="bg-background"
          isValidConnection={(connection) => {
            // Allow connections from any handle to any handle, preventing self-connections
            return connection.source !== connection.target;
          }}
          defaultEdgeOptions={{
            animated: false,
            type: "step",
            style: {
              stroke: "var(--primary)",
              strokeWidth: 2,
              cursor: "pointer",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "var(--primary)",
              width: 15,
              height: 15,
            },
          }}
          connectionLineStyle={{
            stroke: "var(--primary)",
            strokeWidth: 2,
            strokeDasharray: "5,5",
          }}
          snapToGrid={true}
          snapGrid={[20, 20]}
        >
          <Panel
            position="bottom-center"
            className="z-10 p-2 pointer-events-none"
          >
            <div className="text-xs text-muted-foreground bg-background/90 px-3 py-1.5 rounded-md border shadow-sm pointer-events-auto">
              Right-click nodes to delete • Press Delete/Backspace • Click
              connections to delete • Drag from handles to connect
            </div>
          </Panel>

          <Background
            gap={20}
            size={1}
            color="var(--border)"
            className="opacity-50"
          />
          <Controls
            showInteractive={false}
            className="bg-background border border-border rounded-md shadow-sm"
          />
          {miniMapVisible && (
            <MiniMap
              nodeColor={(n) => {
                switch (n.data?.type) {
                  case "conditional":
                    return "var(--amber-500)";
                  case "start":
                    return "var(--success)";
                  case "end":
                    return "var(--destructive)";
                  case "sub-flow":
                    return "var(--primary)";
                  default:
                    return "var(--primary)";
                }
              }}
              maskColor="rgba(240, 240, 240, 0.4)"
              className="bg-background/95 border border-border rounded-md shadow-sm"
            />
          )}
        </ReactFlow>

        <NodeToolbar onAddNode={addNode} />

        {/* AI Sheet */}
        <Sheet open={showAISheet} onOpenChange={setShowAISheet}>
          <SheetContent side="right" className="w-96 lg:min-w-[500px] border-l">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Flow Assistant
              </SheetTitle>
              <SheetDescription>
                Get AI recommendations for your project flow
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MissingFlowDetector project={project} onAddNode={addNode} />
            </div>
            <SheetFooter className="mt-4">
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Node Details Panel */}
      {selectedNode && !showAIPanel && !showSubFlowManager && (
        <div className="flex">
          <NodeDetailsPanel
            node={selectedNode}
            project={project}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
            onDelete={deleteNode}
            onManageSubFlow={() => setShowSubFlowManager(true)}
          />
        </div>
      )}

      {/* Sub-Flow Manager */}
      {showSubFlowManager && selectedNode && (
        <SubFlowManager
          node={selectedNode as FlowNode}
          onUpdateNode={(updatedNode) => {
            handleUpdateNode(updatedNode);
            setShowSubFlowManager(false);
            setSelectedNode(null);
          }}
          onClose={() => {
            setShowSubFlowManager(false);
          }}
        />
      )}
    </div>
  );
}
