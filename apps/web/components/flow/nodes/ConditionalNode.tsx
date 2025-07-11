"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { BaseFlowNode, BaseNodeData } from "./BaseFlowNode";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Trash2, Plus, Edit2, Check, X, GitBranch } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Condition {
  id: string;
  label: string;
  expression: string;
  color: string;
}

export interface ConditionalNodeData extends BaseNodeData {
  type: "conditional";
  conditions: Condition[];
}

export interface ConditionalNodeProps extends NodeProps<ConditionalNodeData> {}

const CONDITION_COLORS = [
  "from-primary to-primary/80",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-amber-600",
  "from-sky-500 to-sky-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-emerald-600",
];

export function ConditionalNode(props: ConditionalNodeProps) {
  const { data, id } = props;

  // Ensure conditions array exists with default value
  const conditions = data.conditions || [];
  const [editingCondition, setEditingCondition] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editExpression, setEditExpression] = useState("");
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newExpression, setNewExpression] = useState("");

  const handleAddCondition = () => {
    if (!newLabel.trim() || !newExpression.trim()) return;

    const newCondition: Condition = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: newLabel.trim(),
      expression: newExpression.trim(),
      color: CONDITION_COLORS[conditions.length % CONDITION_COLORS.length],
    };

    // Update node data
    const event = new CustomEvent("updateNodeData", {
      detail: {
        nodeId: id,
        data: {
          ...data,
          conditions: [...conditions, newCondition],
        },
      },
    });
    window.dispatchEvent(event);

    // Reset form
    setNewLabel("");
    setNewExpression("");
    setIsAddingCondition(false);
  };

  const handleEditCondition = (conditionId: string) => {
    const condition = conditions.find((c) => c.id === conditionId);
    if (condition) {
      setEditingCondition(conditionId);
      setEditLabel(condition.label);
      setEditExpression(condition.expression);
    }
  };

  const handleSaveEdit = () => {
    if (!editLabel.trim() || !editExpression.trim()) return;

    const updatedConditions = conditions.map((condition) =>
      condition.id === editingCondition
        ? {
            ...condition,
            label: editLabel.trim(),
            expression: editExpression.trim(),
          }
        : condition
    );

    // Update node data
    const event = new CustomEvent("updateNodeData", {
      detail: {
        nodeId: id,
        data: {
          ...data,
          conditions: updatedConditions,
        },
      },
    });
    window.dispatchEvent(event);

    // Reset editing state
    setEditingCondition(null);
    setEditLabel("");
    setEditExpression("");
  };

  const handleDeleteCondition = (conditionId: string) => {
    const updatedConditions = conditions.filter((c) => c.id !== conditionId);

    // Update node data
    const event = new CustomEvent("updateNodeData", {
      detail: {
        nodeId: id,
        data: {
          ...data,
          conditions: updatedConditions,
        },
      },
    });
    window.dispatchEvent(event);
  };

  const handleCancelEdit = () => {
    setEditingCondition(null);
    setEditLabel("");
    setEditExpression("");
  };

  const handleCancelAdd = () => {
    setIsAddingCondition(false);
    setNewLabel("");
    setNewExpression("");
  };

  // Custom handles for conditional node
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

      {/* Output handles for each condition */}
      {conditions.map((condition, index) => {
        const totalConditions = conditions.length;
        const spacing = Math.min(80 / (totalConditions + 1), 20); // Adaptive spacing
        const startOffset = 50 - (spacing * (totalConditions - 1)) / 2;
        const topPercent = startOffset + spacing * index;

        return (
          <Handle
            key={condition.id}
            type="source"
            position={Position.Right}
            id={`condition-${condition.id}`}
            className={`w-3 h-3 !bg-muted-foreground !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200`}
            style={{ right: -6, top: `${topPercent}%` }}
          />
        );
      })}
    </>
  );

  return (
    <BaseFlowNode
      {...props}
      customHandles={customHandles}
      showDefaultHandles={false}
    >
      <div className="space-y-2.5">
        {/* Conditions list */}
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <div
              key={condition.id}
              className={cn(
                "flex items-center gap-2 p-2",
                "bg-background/50 rounded-md border border-border/40",
                "group/condition"
              )}
            >
              <div className="flex-1 min-w-0">
                {editingCondition === condition.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Condition label"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={editExpression}
                      onChange={(e) => setEditExpression(e.target.value)}
                      placeholder="Expression (e.g., user.age > 18)"
                      className="h-7 text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        className="h-6 px-2 text-xs"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs bg-muted text-muted-foreground border-none`}
                      >
                        {index + 1}
                      </Badge>
                      <span className="text-xs font-medium text-foreground truncate">
                        {condition.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {condition.expression}
                    </p>
                  </>
                )}
              </div>

              {editingCondition !== condition.id && (
                <div
                  className={cn(
                    "flex items-center gap-1",
                    "opacity-0 group-hover/condition:opacity-100 transition-opacity"
                  )}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditCondition(condition.id)}
                    className="h-6 w-6 p-0 text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCondition(condition.id)}
                    className="h-6 w-6 p-0 text-xs text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new condition */}
        {isAddingCondition ? (
          <div className="p-2 bg-background/50 rounded-md border border-border/40 space-y-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Condition label (e.g., 'Adult User')"
              className="h-7 text-xs"
            />
            <Input
              value={newExpression}
              onChange={(e) => setNewExpression(e.target.value)}
              placeholder="Expression (e.g., user.age >= 18)"
              className="h-7 text-xs"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddCondition}
                className="h-6 px-2 text-xs"
                disabled={!newLabel.trim() || !newExpression.trim()}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelAdd}
                className="h-6 px-2 text-xs"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingCondition(true)}
            className="h-7 text-xs w-full border-dashed"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Condition
          </Button>
        )}

        {/* Info text */}
        {conditions.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            <GitBranch className="w-4 h-4 mx-auto mb-1 opacity-50" />
            Add conditions to create branching logic
          </div>
        )}
      </div>
    </BaseFlowNode>
  );
}
