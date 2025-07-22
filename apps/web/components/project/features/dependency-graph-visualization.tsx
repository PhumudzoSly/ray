"use client";

import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  NodeProps,
  MarkerType,
  Connection,
  ConnectionMode,
  OnConnect,
  OnEdgesDelete,
  EdgeProps,
  getBezierPath,
  BaseEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@workspace/ui/components/button";
import { GitBranch, X, ArrowRight, Trash2, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as featureActions from "@/actions/project/features";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { PhaseSelector } from "@/components/ui/selectors/phase-selector";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";

interface Feature {
  id: string;
  name: string;
  phase: string;
  priority: string;
  assignedTo?: string;
  user?: {
    name?: string;
    image?: string;
  };
}

interface FeatureNodeData extends Feature {
  currentFeatureId?: string;
}

interface Dependency {
  parentId: string;
  dependentFeatureId: string;
}

interface DependencyGraphVisualizationProps {
  features: Feature[];
  dependencies: Dependency[];
  currentFeatureId?: string;
}

interface DependencyEdgeData {
  parentFeature: Feature;
  dependentFeature: Feature;
  onRemove: (parentId: string, dependentId: string) => void;
}

// Custom Dependency Edge Component with labels and remove functionality
const DependencyEdge: React.FC<EdgeProps<DependencyEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onRemove) {
      data.onRemove(data.parentFeature.id, data.dependentFeature.id);
    }
  };

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: selected || isHovered ? 3 : 2,
            stroke: selected ? "#3b82f6" : isHovered ? "#6b7280" : "#9ca3af",
          }}
        />
      </g>

      {/* Edge Label */}
      <foreignObject
        width={40}
        height={40}
        x={labelX - 10}
        y={labelY - 10}
        className="overflow-visible"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          className={`
            flex items-center justify-center gap-1  py-1 rounded-md text-xs font-medium
            transition-all duration-200 pointer-events-auto
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Button
            variant="error"
            size="icon"
            className="h-4 w-4"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </foreignObject>
    </>
  );
};

// Custom Feature Node Component
const FeatureNode: React.FC<NodeProps<FeatureNodeData>> = ({
  data,
  selected,
}) => {
  const isCurrentFeature = data.id === data.currentFeatureId;

  return (
    <div
      className={`
        relative bg-card rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px] max-w-[250px]
        ${isCurrentFeature ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
        ${selected ? "ring-2 ring-blue-300" : ""}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-border hover:bg-blue-500 transition-colors"
        style={{ left: -6 }}
      />

      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight truncate">
              {data.name}
            </h3>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <PhaseSelector phase={data.phase} disabled={true} />
          <PrioritySelector disabled={true} priority={data.priority} />
        </div>

        {/* Current feature indicator */}
        {isCurrentFeature && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <GitBranch className="h-3 w-3" />
            <span>Current Feature</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-border hover:bg-blue-500 transition-colors"
        style={{ right: -6 }}
      />
    </div>
  );
};

const nodeTypes = {
  feature: FeatureNode,
};

const edgeTypes = {
  dependency: DependencyEdge,
};

// Auto-layout algorithm (simple hierarchical layout)
const getLayoutedElements = (
  features: Feature[],
  dependencies: Dependency[],
  currentFeatureId?: string,
  onRemoveDependency?: (parentId: string, dependentId: string) => void
) => {
  const nodes: Node<FeatureNodeData>[] = [];
  const edges: Edge<DependencyEdgeData>[] = [];

  // Create a dependency map
  const dependencyMap = new Map<string, string[]>();
  const reverseDependencyMap = new Map<string, string[]>();

  dependencies.forEach((dep) => {
    if (!dependencyMap.has(dep.parentId)) {
      dependencyMap.set(dep.parentId, []);
    }
    dependencyMap.get(dep.parentId)!.push(dep.dependentFeatureId);

    if (!reverseDependencyMap.has(dep.dependentFeatureId)) {
      reverseDependencyMap.set(dep.dependentFeatureId, []);
    }
    reverseDependencyMap.get(dep.dependentFeatureId)!.push(dep.parentId);
  });

  // Calculate levels (topological sort)
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  const calculateLevel = (featureId: string): number => {
    if (levels.has(featureId)) return levels.get(featureId)!;
    if (visited.has(featureId)) return 0; // Cycle detection

    visited.add(featureId);
    const dependencies = reverseDependencyMap.get(featureId) || [];
    const maxParentLevel =
      dependencies.length > 0
        ? Math.max(...dependencies.map(calculateLevel))
        : -1;

    const level = maxParentLevel + 1;
    levels.set(featureId, level);
    visited.delete(featureId);
    return level;
  };

  features.forEach((feature) => calculateLevel(feature.id));

  // Group features by level
  const levelGroups = new Map<number, Feature[]>();
  features.forEach((feature) => {
    const level = levels.get(feature.id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(feature);
  });

  // Position nodes
  const levelWidth = 300;
  const nodeHeight = 100;
  const levelKeys = Array.from(levelGroups.keys()).sort((a, b) => a - b);

  levelKeys.forEach((level) => {
    const featuresInLevel = levelGroups.get(level)!;
    const startY = (-(featuresInLevel.length - 1) * nodeHeight) / 2;

    featuresInLevel.forEach((feature, index) => {
      nodes.push({
        id: feature.id,
        type: "feature",
        position: {
          x: level * levelWidth,
          y: startY + index * nodeHeight,
        },
        data: { ...feature, currentFeatureId },
      });
    });
  });

  // Create edges with labels and remove functionality
  dependencies.forEach((dep) => {
    const parentFeature = features.find((f) => f.id === dep.parentId);
    const dependentFeature = features.find(
      (f) => f.id === dep.dependentFeatureId
    );

    if (parentFeature && dependentFeature) {
      edges.push({
        id: `${dep.parentId}-${dep.dependentFeatureId}`,
        source: dep.parentId,
        target: dep.dependentFeatureId,
        type: "dependency",
        animated: false,
        style: {
          stroke: "#6B7280",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6B7280",
        },
        data: {
          parentFeature,
          dependentFeature,
          onRemove: onRemoveDependency || (() => {}),
        },
      });
    }
  });

  return { nodes, edges };
};

const DependencyGraphVisualization: React.FC<
  DependencyGraphVisualizationProps
> = ({ features, dependencies, currentFeatureId }) => {
  const { token } = useSession();
  const [pendingRemoval, setPendingRemoval] = useState<{
    parentId: string;
    dependentId: string;
    parentName: string;
    dependentName: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const addDependencyMutation = useMutation({
    mutationFn: async ({
      parentId,
      dependentFeatureId,
    }: {
      parentId: string;
      dependentFeatureId: string;
    }) => featureActions.addFeatureDependency({ parentId, dependentFeatureId }),
    onSuccess: (data, variables) => {
      // Comprehensive invalidation for real-time updates
      const { parentId, dependentFeatureId } = variables;

      // Invalidate dependencies for both features
      queryClient.invalidateQueries({
        queryKey: ["featureDependencies", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureDependencies", parentId],
      });

      // Invalidate feature details for both features
      queryClient.invalidateQueries({
        queryKey: ["feature", dependentFeatureId],
      });
      queryClient.invalidateQueries({ queryKey: ["feature", parentId] });

      // Invalidate feature hierarchies for both features
      queryClient.invalidateQueries({
        queryKey: ["featureHierarchy", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureHierarchy", parentId],
      });

      // Invalidate validation results for both features
      queryClient.invalidateQueries({
        queryKey: ["featureValidation", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureValidation", parentId],
      });

      // Invalidate activity feeds for both features
      queryClient.invalidateQueries({
        queryKey: ["activity-feed", "FEATURE", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-feed", "FEATURE", parentId],
      });

      // Invalidate project-level queries
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["featureDependencyGraph"] });
      queryClient.invalidateQueries({ queryKey: ["projectDependencyStats"] });
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: async ({
      parentId,
      dependentFeatureId,
    }: {
      parentId: string;
      dependentFeatureId: string;
    }) =>
      featureActions.removeFeatureDependency({ parentId, dependentFeatureId }),
    onSuccess: (data, variables) => {
      // Comprehensive invalidation for real-time updates
      const { parentId, dependentFeatureId } = variables;

      // Invalidate dependencies for both features
      queryClient.invalidateQueries({
        queryKey: ["featureDependencies", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureDependencies", parentId],
      });

      // Invalidate feature details for both features
      queryClient.invalidateQueries({
        queryKey: ["feature", dependentFeatureId],
      });
      queryClient.invalidateQueries({ queryKey: ["feature", parentId] });

      // Invalidate feature hierarchies for both features
      queryClient.invalidateQueries({
        queryKey: ["featureHierarchy", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureHierarchy", parentId],
      });

      // Invalidate validation results for both features
      queryClient.invalidateQueries({
        queryKey: ["featureValidation", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["featureValidation", parentId],
      });

      // Invalidate activity feeds for both features
      queryClient.invalidateQueries({
        queryKey: ["activity-feed", "FEATURE", dependentFeatureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-feed", "FEATURE", parentId],
      });

      // Invalidate project-level queries
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["featureDependencyGraph"] });
      queryClient.invalidateQueries({ queryKey: ["projectDependencyStats"] });
    },
  });

  // Stabilize the remove dependency handler with useCallback
  const handleRemoveDependency = useCallback(
    (parentId: string, dependentId: string) => {
      removeDependencyMutation.mutate({
        parentId,
        dependentFeatureId: dependentId,
      });
    },
    [removeDependencyMutation]
  );

  // Confirm dependency removal
  const confirmRemoveDependency = useCallback(async () => {
    if (!pendingRemoval || !token) return;

    try {
      await removeDependencyMutation.mutateAsync({
        parentId: pendingRemoval.parentId,
        dependentFeatureId: pendingRemoval.dependentId,
      });

      toast.success(
        `Removed dependency: "${pendingRemoval.dependentName}" no longer depends on "${pendingRemoval.parentName}"`
      );
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast.error("Failed to remove dependency");
    } finally {
      setPendingRemoval(null);
    }
  }, [pendingRemoval, removeDependencyMutation, token]);

  // Memoize the initial layout to prevent recalculation on every render
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return getLayoutedElements(
      features,
      dependencies,
      currentFeatureId,
      handleRemoveDependency
    );
  }, [features, dependencies, currentFeatureId, handleRemoveDependency]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes - removed handleRemoveDependency from dependencies
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
      features,
      dependencies,
      currentFeatureId,
      handleRemoveDependency
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [features, dependencies, currentFeatureId, setNodes, setEdges]);

  // Handle new connections (creating dependencies)
  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target || !token) return;

      // Prevent self-connections
      if (connection.source === connection.target) {
        toast.error("A feature cannot depend on itself");
        return;
      }

      // Check if dependency already exists
      const existingDependency = dependencies.find(
        (dep) =>
          dep.parentId === connection.source &&
          dep.dependentFeatureId === connection.target
      );

      // Prevent mutual dependencies (A->B if B->A exists)
      const mutualDependency = dependencies.find(
        (dep) =>
          dep.parentId === connection.target &&
          dep.dependentFeatureId === connection.source
      );

      if (existingDependency) {
        toast.error("This dependency already exists");
        return;
      }
      if (mutualDependency) {
        toast.error("Mutual dependencies are not allowed");
        return;
      }

      try {
        // Add the dependency using the mutation
        await addDependencyMutation.mutateAsync({
          parentId: connection.source as string,
          dependentFeatureId: connection.target as string,
        });

        // Find feature names for better feedback
        const sourceFeature = features.find((f) => f.id === connection.source);
        const targetFeature = features.find((f) => f.id === connection.target);

        toast.success(
          `Added dependency: "${targetFeature?.name}" now depends on "${sourceFeature?.name}"`
        );
      } catch (error) {
        console.error("Error adding dependency:", error);
        toast.error(
          "Failed to add dependency. This might create a circular dependency."
        );
      }
    },
    [dependencies, features, token, addDependencyMutation]
  );

  // Handle edge deletion (removing dependencies) - kept for keyboard shortcuts
  const onEdgesDelete: OnEdgesDelete = useCallback(
    async (edgesToDelete) => {
      if (!token) return;

      for (const edge of edgesToDelete) {
        const parentFeature = features.find((f) => f.id === edge.source);
        const dependentFeature = features.find((f) => f.id === edge.target);

        if (parentFeature && dependentFeature) {
          handleRemoveDependency(edge.source, edge.target);
          break; // Only handle one at a time with confirmation
        }
      }
    },
    [features, token, handleRemoveDependency]
  );

  // Validate connections
  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false;

      // Check if dependency already exists
      const existingDependency = dependencies.find(
        (dep) =>
          dep.parentId === connection.source &&
          dep.dependentFeatureId === connection.target
      );

      return !existingDependency;
    },
    [dependencies]
  );

  if (features.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No features to display</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      isValidConnection={isValidConnection}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Strict}
      fitView
      fitViewOptions={{
        padding: 0.2,
      }}
      minZoom={0.5}
      maxZoom={2}
      className="m-0 p-0"
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      deleteKeyCode={["Backspace", "Delete"]}
      multiSelectionKeyCode={["Meta", "Ctrl"]}
    >
      <Background color="#f1f5f9" gap={20} />
      <Controls className="bg-white border shadow-sm" showInteractive={false} />
    </ReactFlow>
  );
};

export default DependencyGraphVisualization;
