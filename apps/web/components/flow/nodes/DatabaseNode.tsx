"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { DatabaseNodeData, SpecializedNodeProps, HandleConfig } from "./types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Card } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import { Database, Table, Key, Link, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function DatabaseNode(props: SpecializedNodeProps<DatabaseNodeData>) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for database node
  const databaseHandles: HandleConfig[] = [
    {
      id: "query-input",
      type: "target",
      position: "top",
      label: "Query",
      className: "!bg-blue-500",
    },
    {
      id: "data-output",
      type: "source",
      position: "right",
      label: "Data",
      className: "!bg-green-500",
    },
    {
      id: "error-output",
      type: "source",
      position: "bottom",
      label: "Error",
      className: "!bg-red-500",
    },
    {
      id: "cache-output",
      type: "source",
      position: "left",
      label: "Cache",
      className: "!bg-purple-500",
    },
  ];

  const handleOperationChange = (operation: DatabaseNodeData["operation"]) => {
    onDataChange?.({ operation });
  };

  const handleTableNameChange = (tableName: string) => {
    onDataChange?.({ tableName });
  };

  const handleSchemaChange = (schema: any) => {
    onDataChange?.({ schema });
  };

  const handleIndexingChange = (indexing: string[]) => {
    onDataChange?.({ indexing });
  };

  const handleRelationshipChange = (
    relationships: DatabaseNodeData["relationships"]
  ) => {
    onDataChange?.({ relationships });
  };

  const addRelationship = () => {
    const newRelationship = {
      type: "one-to-many" as const,
      targetTable: "",
      foreignKey: "",
    };
    const currentRelationships = data.relationships || [];
    onDataChange?.({
      relationships: [...currentRelationships, newRelationship],
    });
  };

  const removeRelationship = (index: number) => {
    const currentRelationships = data.relationships || [];
    const newRelationships = currentRelationships.filter((_, i) => i !== index);
    onDataChange?.({ relationships: newRelationships });
  };

  const updateRelationship = (index: number, field: string, value: any) => {
    const currentRelationships = data.relationships || [];
    const newRelationships = [...currentRelationships];
    newRelationships[index] = { ...newRelationships[index], [field]: value };
    onDataChange?.({ relationships: newRelationships });
  };

  const operationColors = {
    create: "bg-green-500",
    read: "bg-blue-500",
    update: "bg-yellow-500",
    delete: "bg-red-500",
    query: "bg-purple-500",
  };

  const operationIcons = {
    create: "Plus",
    read: "Eye",
    update: "Edit",
    delete: "Trash",
    query: "Search",
  };

  const getPerformanceScore = () => {
    let score = 0;
    if (data.indexing && data.indexing.length > 0) score += 30;
    if (data.caching) score += 25;
    if (data.relationships && data.relationships.length > 0) score += 20;
    if (data.schema) score += 25;
    return score;
  };

  return (
    <BaseFlowNode
      {...props}
      handles={databaseHandles}
      nodeIcon={operationIcons[data.operation] || "Database"}
      nodeColor={operationColors[data.operation] || "bg-blue-500"}
      className="min-w-[320px] max-w-[480px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* Operation and Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Database Operation</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs text-white",
                operationColors[data.operation]
              )}
            >
              {data.operation.toUpperCase()}
            </Badge>
          </div>

          <div className="flex gap-2">
            {!isReadOnly && (
              <Select
                value={data.operation}
                onValueChange={handleOperationChange}
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">CREATE</SelectItem>
                  <SelectItem value="read">READ</SelectItem>
                  <SelectItem value="update">UPDATE</SelectItem>
                  <SelectItem value="delete">DELETE</SelectItem>
                  <SelectItem value="query">QUERY</SelectItem>
                </SelectContent>
              </Select>
            )}

            {!isReadOnly ? (
              <Input
                placeholder="table_name"
                value={data.tableName || ""}
                onChange={(e) => handleTableNameChange(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
            ) : (
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-xs">
                {data.tableName || "table_name"}
              </div>
            )}
          </div>
        </div>

        {/* Indexing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Indexed Fields</Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.indexing?.length || 0} fields
            </Badge>
          </div>

          {!isReadOnly ? (
            <Input
              placeholder="field1, field2, field3"
              value={data.indexing?.join(", ") || ""}
              onChange={(e) => {
                const fields = e.target.value
                  .split(",")
                  .map((f) => f.trim())
                  .filter((f) => f);
                handleIndexingChange(fields);
              }}
              className="h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {data.indexing?.join(", ") || "No indexed fields"}
            </div>
          )}
        </div>

        {/* Caching and Transactions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Caching</Label>
            </div>
            {!isReadOnly ? (
              <Switch
                checked={data.caching || false}
                onCheckedChange={(checked) =>
                  onDataChange?.({ caching: checked })
                }
              />
            ) : (
              <Badge
                variant={data.caching ? "default" : "secondary"}
                className="text-xs"
              >
                {data.caching ? "On" : "Off"}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Transactions</Label>
            </div>
            {!isReadOnly ? (
              <Switch
                checked={data.transactions || false}
                onCheckedChange={(checked) =>
                  onDataChange?.({ transactions: checked })
                }
              />
            ) : (
              <Badge
                variant={data.transactions ? "default" : "secondary"}
                className="text-xs"
              >
                {data.transactions ? "On" : "Off"}
              </Badge>
            )}
          </div>
        </div>

        {/* Schema */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Schema</Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs p-0"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={isReadOnly}
            >
              {isExpanded ? "▼" : "▶"}
            </Button>
          </div>

          {isExpanded && (
            <Card className="p-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Table Schema</Label>
                {!isReadOnly ? (
                  <Textarea
                    placeholder={`{
  "id": "integer primary key",
  "name": "varchar(255) not null",
  "email": "varchar(255) unique",
  "created_at": "timestamp default now()"
}`}
                    value={
                      data.schema ? JSON.stringify(data.schema, null, 2) : ""
                    }
                    onChange={(e) => {
                      try {
                        const schema = e.target.value
                          ? JSON.parse(e.target.value)
                          : undefined;
                        handleSchemaChange(schema);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="text-xs font-mono"
                    rows={4}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                    {data.schema
                      ? JSON.stringify(data.schema, null, 2)
                      : "No schema defined"}
                  </div>
                )}
              </div>

              {/* Relationships */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Relationships</Label>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={addRelationship}
                    >
                      Add
                    </Button>
                  )}
                </div>

                {data.relationships && data.relationships.length > 0 ? (
                  <div className="space-y-2">
                    {data.relationships.map((rel, index) => (
                      <div key={index} className="p-2 border rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              Relationship {index + 1}
                            </span>
                          </div>
                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                              onClick={() => removeRelationship(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Type</Label>
                            {!isReadOnly ? (
                              <Select
                                value={rel.type}
                                onValueChange={(value) =>
                                  updateRelationship(index, "type", value)
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="one-to-one">
                                    One-to-One
                                  </SelectItem>
                                  <SelectItem value="one-to-many">
                                    One-to-Many
                                  </SelectItem>
                                  <SelectItem value="many-to-many">
                                    Many-to-Many
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="text-xs bg-muted p-1 rounded">
                                {rel.type}
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs">Target Table</Label>
                            {!isReadOnly ? (
                              <Input
                                value={rel.targetTable}
                                onChange={(e) =>
                                  updateRelationship(
                                    index,
                                    "targetTable",
                                    e.target.value
                                  )
                                }
                                className="h-7 text-xs"
                                placeholder="users"
                              />
                            ) : (
                              <div className="text-xs bg-muted p-1 rounded">
                                {rel.targetTable || "N/A"}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Foreign Key</Label>
                          {!isReadOnly ? (
                            <Input
                              value={rel.foreignKey}
                              onChange={(e) =>
                                updateRelationship(
                                  index,
                                  "foreignKey",
                                  e.target.value
                                )
                              }
                              className="h-7 text-xs"
                              placeholder="user_id"
                            />
                          ) : (
                            <div className="text-xs bg-muted p-1 rounded">
                              {rel.foreignKey || "N/A"}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No relationships defined
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Performance Indicators */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {data.indexing && data.indexing.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700"
              >
                Indexed
              </Badge>
            )}
            {data.caching && (
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700"
              >
                Cached
              </Badge>
            )}
            {data.transactions && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700"
              >
                ACID
              </Badge>
            )}
          </div>

          {/* Performance Score */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getPerformanceScore()}/100
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
