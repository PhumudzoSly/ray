"use client";

import { NodeProps } from "reactflow";
import { StandardNode } from "./StandardNode";
import { ConditionalNode } from "./ConditionalNode";
import { StartNode } from "./StartNode";
import { EndNode } from "./EndNode";
import { BooleanNode } from "./BooleanNode";

// This is the data structure that comes from the FlowNode type
interface FlowNodeData {
  type: string;
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
  conditions?: any[];
  [key: string]: any;
}

export interface FlowNodeRouterProps extends NodeProps<FlowNodeData> {}

export function FlowNodeRouter(props: FlowNodeRouterProps) {
  const { data } = props;

  // Route to the appropriate component based on data.type
  switch (data.type) {
    case "conditional":
      // Ensure conditional nodes have conditions array
      const conditionalProps = {
        ...props,
        data: {
          ...data,
          type: "conditional" as const,
          conditions: data.conditions || [],
        },
      };
      return <ConditionalNode {...(conditionalProps as any)} />;
    case "start":
      const startProps = {
        ...props,
        data: { ...data, type: "start" as const },
      };
      return <StartNode {...(startProps as any)} />;
    case "end":
      const endProps = {
        ...props,
        data: { ...data, type: "end" as const },
      };
      return <EndNode {...(endProps as any)} />;
    case "boolean":
      const booleanProps = {
        ...props,
        data: { ...data, type: "boolean" as const },
      };
      return <BooleanNode {...(booleanProps as any)} />;
    default:
      return <StandardNode {...(props as any)} />;
  }
}
