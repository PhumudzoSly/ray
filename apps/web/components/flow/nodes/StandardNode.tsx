"use client";

import { NodeProps } from "reactflow";
import { BaseFlowNode, BaseNodeData } from "./BaseFlowNode";

export interface StandardNodeData extends BaseNodeData {
  // Standard nodes can have any type except conditional
  type: Exclude<string, "conditional">;
}

export interface StandardNodeProps extends NodeProps<StandardNodeData> {}

export function StandardNode(props: StandardNodeProps) {
  return <BaseFlowNode showDefaultHandles {...props} />;
}
