"use client";

import { NodeProps, Handle, Position } from "reactflow";
import { BaseFlowNode, BaseNodeData } from "./BaseFlowNode";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BooleanNodeData extends BaseNodeData {
  type: "boolean";
  trueLabel?: string;
  falseLabel?: string;
}

export interface BooleanNodeProps extends NodeProps<BooleanNodeData> {}

export function BooleanNode(props: BooleanNodeProps) {
  const { data } = props;

  // Default labels for true/false outputs
  const trueLabel = data.trueLabel || "True";
  const falseLabel = data.falseLabel || "False";

  // Custom handles for boolean node
  const customHandles = (
    <>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 !bg-green-500 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ left: -6, top: "50%" }}
      />

      {/* True output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="true-output"
        className="w-3 h-3 !bg-green-500 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ right: -6, top: "35%" }}
      />

      {/* False output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false-output"
        className="w-3 h-3 !bg-red-500 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ right: -6, top: "65%" }}
      />
    </>
  );

  return (
    <BaseFlowNode
      {...props}
      customHandles={customHandles}
      showDefaultHandles={false}
    >
      <div className="space-y-2">
        {/* True output indicator */}
        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <Badge
              variant="outline"
              className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
            >
              {trueLabel}
            </Badge>
          </div>
        </div>

        {/* False output indicator */}
        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <Badge
              variant="outline"
              className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
            >
              {falseLabel}
            </Badge>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
