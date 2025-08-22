"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitiveMoves, createCompetitiveMove, updateCompetitiveMove, deleteCompetitiveMove } from "@/actions/idea/competitor";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { toast } from "sonner";
import { Plus, Edit, Trash2, TrendingUp, Calendar, Target, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CompetitorMovesViewProps {
  competitorId: string;
}

type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface CompetitiveMove {
  id: string;
  competitorId: string;
  moveType: string;
  title: string;
  description: string;
  impactLevel: Importance;
  targetAudience?: string | null;
  affectedFeatures: string[];
  announcedDate?: Date | null;
  launchDate?: Date | null;
  completionDate?: Date | null;
  userFeedback?: string | null;
  pressCoverage: string[];
  opportunities: string[];
  threats: string[];
  responseRequired: boolean;
  responseStrategy?: string | null;
  createdAt: Date;
}

const impactColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800"
};

const moveTypeColors = {
  "Product Launch": "bg-blue-100 text-blue-800",
  "Feature Update": "bg-green-100 text-green-800",
  "Pricing Change": "bg-purple-100 text-purple-800",
  "Market Expansion": "bg-indigo-100 text-indigo-800",
  "Partnership": "bg-pink-100 text-pink-800",
  "Acquisition": "bg-red-100 text-red-800",
  "Other": "bg-gray-100 text-gray-800"
};

export const CompetitorMovesView: React.FC<CompetitorMovesViewProps> = ({ competitorId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMove, setEditingMove] = useState<CompetitiveMove | null>(null);
  const [newMove, setNewMove] = useState({
    moveType: "",
    title: "",
    description: "",
    impactLevel: "MEDIUM" as Importance,
    targetAudience: "",
    affectedFeatures: [] as string[],
    announcedDate: "",
    launchDate: "",
    completionDate: "",
    opportunities: [] as string[],
    threats: [] as string[],
    responseRequired: false,
    responseStrategy: ""
  });

  const queryClient = useQueryClient();

  const { data: competitiveMoves, isLoading } = useQuery({
    queryKey: ["competitiveMoves", competitorId],
    queryFn: () => getCompetitiveMoves(competitorId),
  });

  const createMutation = useMutation({
    mutationFn: createCompetitiveMove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitiveMoves", competitorId] });
      setIsCreateDialogOpen(false);
      resetNewMove();
      toast.success("Competitive move created successfully");
    },
    onError: () => {
      toast.error("Failed to create competitive move");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, move }: { id: string; move: any }) => updateCompetitiveMove({ id, move }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitiveMoves", competitorId] });
      setEditingMove(null);
      toast.success("Competitive move updated successfully");
    },
    onError: () => {
      toast.error("Failed to update competitive move");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompetitiveMove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitiveMoves", competitorId] });
      toast.success("Competitive move deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete competitive move");
    },
  });

  const resetNewMove = () => {
    setNewMove({
      moveType: "",
      title: "",
      description: "",
      impactLevel: "MEDIUM",
      targetAudience: "",
      affectedFeatures: [],
      announcedDate: "",
      launchDate: "",
      completionDate: "",
      opportunities: [],
      threats: [],
      responseRequired: false,
      responseStrategy: ""
    });
  };

  const handleCreate = () => {
    if (!newMove.title.trim() || !newMove.moveType.trim()) {
      toast.error("Please provide title and move type");
      return;
    }

    const moveData: any = {
      competitorId,
      moveType: newMove.moveType,
      title: newMove.title,
      description: newMove.description,
      impactLevel: newMove.impactLevel,
      targetAudience: newMove.targetAudience || null,
      affectedFeatures: newMove.affectedFeatures,
      opportunities: newMove.opportunities,
      threats: newMove.threats,
      responseRequired: newMove.responseRequired,
      responseStrategy: newMove.responseStrategy || null,
    };

    if (newMove.announcedDate) moveData.announcedDate = new Date(newMove.announcedDate);
    if (newMove.launchDate) moveData.launchDate = new Date(newMove.launchDate);
    if (newMove.completionDate) moveData.completionDate = new Date(newMove.completionDate);

    createMutation.mutate({ move: moveData });
  };

  const handleUpdate = (move: CompetitiveMove) => {
    const updateData: any = {
      moveType: move.moveType,
      title: move.title,
      description: move.description,
      impactLevel: move.impactLevel,
      targetAudience: move.targetAudience,
      affectedFeatures: move.affectedFeatures,
      opportunities: move.opportunities,
      threats: move.threats,
      responseRequired: move.responseRequired,
      responseStrategy: move.responseStrategy,
      announcedDate: move.announcedDate,
      launchDate: move.launchDate,
      completionDate: move.completionDate,
    };

    updateMutation.mutate({ id: move.id, move: updateData });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this competitive move?")) {
      deleteMutation.mutate({ id });
    }
  };

  const addArrayItem = (field: 'affectedFeatures' | 'opportunities' | 'threats', value: string) => {
    if (value.trim()) {
      setNewMove(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'affectedFeatures' | 'opportunities' | 'threats', index: number) => {
    setNewMove(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (move: CompetitiveMove) => {
    if (move.completionDate) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (move.launchDate && new Date(move.launchDate) <= new Date()) return <Target className="h-4 w-4 text-blue-600" />;
    if (move.announcedDate) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (move: CompetitiveMove) => {
    if (move.completionDate) return "Completed";
    if (move.launchDate && new Date(move.launchDate) <= new Date()) return "Launched";
    if (move.announcedDate) return "Announced";
    return "Planned";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Competitive Moves</h3>
          <Badge variant="outline" className="ml-2">
            {competitiveMoves?.length || 0} moves
          </Badge>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Move
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Competitive Move</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moveType">Move Type</Label>
                  <Select
                    value={newMove.moveType}
                    onValueChange={(value) => setNewMove({ ...newMove, moveType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select move type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Product Launch">Product Launch</SelectItem>
                      <SelectItem value="Feature Update">Feature Update</SelectItem>
                      <SelectItem value="Pricing Change">Pricing Change</SelectItem>
                      <SelectItem value="Market Expansion">Market Expansion</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Acquisition">Acquisition</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="impactLevel">Impact Level</Label>
                  <Select
                    value={newMove.impactLevel}
                    onValueChange={(value: Importance) => setNewMove({ ...newMove, impactLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter move title..."
                  value={newMove.title}
                  onChange={(e) => setNewMove({ ...newMove, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the competitive move..."
                  value={newMove.description}
                  onChange={(e) => setNewMove({ ...newMove, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="announcedDate">Announced Date</Label>
                  <Input
                    id="announcedDate"
                    type="date"
                    value={newMove.announcedDate}
                    onChange={(e) => setNewMove({ ...newMove, announcedDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="launchDate">Launch Date</Label>
                  <Input
                    id="launchDate"
                    type="date"
                    value={newMove.launchDate}
                    onChange={(e) => setNewMove({ ...newMove, launchDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={newMove.completionDate}
                    onChange={(e) => setNewMove({ ...newMove, completionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="responseRequired"
                  checked={newMove.responseRequired}
                  onCheckedChange={(checked) => setNewMove({ ...newMove, responseRequired: !!checked })}
                />
                <Label htmlFor="responseRequired">Response Required</Label>
              </div>

              {newMove.responseRequired && (
                <div>
                  <Label htmlFor="responseStrategy">Response Strategy</Label>
                  <Textarea
                    id="responseStrategy"
                    placeholder="Describe the response strategy..."
                    value={newMove.responseStrategy}
                    onChange={(e) => setNewMove({ ...newMove, responseStrategy: e.target.value })}
                    rows={2}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {!competitiveMoves || competitiveMoves.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No competitive moves yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track competitor activities, product launches, and strategic moves.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Move
            </Button>
          </div>
        ) : (
          competitiveMoves.map((move) => (
            <Card key={move.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon({...move, competitorId:move.competitorId:})}
                      <CardTitle className="text-lg">{move.title}</CardTitle>
                      <Badge 
                        className={cn("text-xs", moveTypeColors[move.moveType as keyof typeof moveTypeColors] || moveTypeColors.Other)}
                      >
                        {move.moveType}
                      </Badge>
                      <Badge className={cn("text-xs", impactColors[move.impactLevel])}>
                        {move.impactLevel} Impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(move)}
                        {getStatusText(move)}
                      </span>
                      {move.announcedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Announced {format(new Date(move.announcedDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingMove(move)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(move.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{move.description}</p>
                
                {(move.opportunities.length > 0 || move.threats.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {move.opportunities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">Opportunities</h4>
                        <ul className="text-xs space-y-1">
                          {move.opportunities.map((opportunity, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-600 mt-0.5">•</span>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {move.threats.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">Threats</h4>
                        <ul className="text-xs space-y-1">
                          {move.threats.map((threat, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-red-600 mt-0.5">•</span>
                              {threat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {move.responseRequired && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Response Required</span>
                    </div>
                    {move.responseStrategy && (
                      <p className="text-sm text-yellow-700">{move.responseStrategy}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Added {format(new Date(move.createdAt), 'MMM dd, yyyy')}</span>
                  {(move.launchDate || move.completionDate) && (
                    <span>
                      {move.completionDate 
                        ? `Completed ${format(new Date(move.completionDate), 'MMM dd, yyyy')}`
                        : move.launchDate 
                        ? `Launches ${format(new Date(move.launchDate), 'MMM dd, yyyy')}`
                        : ''
                      }
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};