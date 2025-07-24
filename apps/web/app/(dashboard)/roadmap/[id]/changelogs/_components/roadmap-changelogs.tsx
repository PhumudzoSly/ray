"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  Plus,
  Edit,
  Calendar,
  Globe,
  ChevronDown,
  ChevronRight,
  ListPlus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import NoData from "@/components/shared/no-data";
import {
  updateRoadmapChangelog,
  deleteRoadmapChangelog,
  deleteChangelogEntry,
} from "@/actions/roadmap/changelogs";
import { ChangelogDialog } from "./changelog-dialog";
import { ChangelogEntryDialog } from "./changelog-entry-dialog";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";

interface RoadmapChangelogsProps {
  changelogs: any[];
  onCreateChangelog: () => void;
  roadmapId: string;
  projectId: string;
}

const CHANGELOG_ENTRY_TYPES = [
  { value: "FEATURE", label: "Feature", color: "bg-green-500" },
  { value: "FIX", label: "Fix", color: "bg-blue-500" },
  { value: "IMPROVEMENT", label: "Improvement", color: "bg-purple-500" },
  { value: "BREAKING", label: "Breaking Change", color: "bg-red-500" },
];

export function RoadmapChangelogs({
  changelogs,
  onCreateChangelog,
  roadmapId,
  projectId,
}: RoadmapChangelogsProps) {
  //
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingChangelog, setEditingChangelog] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addingEntryToChangelog, setAddingEntryToChangelog] =
    useState<any>(null);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getTypeColor = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find((t) => t.value === type);
    return typeConfig?.color || "bg-gray-500";
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find((t) => t.value === type);
    return typeConfig?.label || type;
  };

  const groupEntriesByType = (entries: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    entries.forEach((entry) => {
      if (!grouped[entry.type]) {
        grouped[entry.type] = [];
      }
      grouped[entry.type]?.push(entry);
    });
    return grouped;
  };

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (changelogId: string) => {
      return updateRoadmapChangelog(changelogId, { isPublished: true });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog published successfully!");
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to publish changelog");
      }
    },
    onError: (error) => {
      toast.error("Failed to publish changelog");
      console.error("Publish error:", error);
    },
  });

  // Delete changelog mutation
  const deleteMutation = useMutation({
    mutationFn: async (changelogId: string) => {
      return deleteRoadmapChangelog(changelogId);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to delete changelog");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete changelog");
      console.error("Delete error:", error);
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return deleteChangelogEntry(entryId);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Entry deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to delete entry");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete entry");
      console.error("Delete entry error:", error);
    },
  });

  // Handle edit
  const handleEdit = (changelog: any) => {
    setEditingChangelog(changelog);
    setIsEditDialogOpen(true);
  };

  // Handle publish
  const handlePublish = (changelogId: string) => {
    publishMutation.mutate(changelogId);
  };

  // Handle add entry
  const handleAddEntry = (changelog: any) => {
    setAddingEntryToChangelog(changelog);
    setIsEntryDialogOpen(true);
  };

  // Handle delete changelog
  const handleDelete = async (changelogId: string) => {
    const isConfirmed = await confirm({
      title: "Delete Changelog",
      description:
        "Are you sure you want to delete this changelog? This action cannot be undone.",
    });
    if (isConfirmed) {
      deleteMutation.mutate(changelogId);
    }
  };

  // Handle delete entry
  const handleDeleteEntry = async (entryId: string, entryTitle: string) => {
    const isConfirmed = await confirm({
      title: "Delete Entry",
      description: `Are you sure you want to delete "${entryTitle}"? This action cannot be undone.`,
    });
    if (isConfirmed) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setEditingChangelog(null);
    setIsEditDialogOpen(false);
  };

  // Handle entry dialog close
  const handleEntryDialogClose = () => {
    setAddingEntryToChangelog(null);
    setIsEntryDialogOpen(false);
  };

  if (changelogs === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Changelogs</h2>
            <p className="text-muted-foreground text-sm">
              Keep your users informed about roadmap updates and new features.
            </p>
          </div>
          <Button onClick={onCreateChangelog}>
            <Plus className="w-4 h-4 mr-2" />
            New Changelog
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (changelogs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Changelogs</h2>
            <p className="text-muted-foreground text-sm">
              Keep your users informed about roadmap updates and new features.
            </p>
          </div>
          <Button onClick={onCreateChangelog}>
            <Plus className="w-4 h-4 mr-2" />
            New Changelog
          </Button>
        </div>
        <NoData title="No Changelogs" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Changelogs</h2>
          <p className="text-muted-foreground text-sm">
            Keep your users informed about roadmap updates and new features.
          </p>
        </div>
        <Button onClick={onCreateChangelog}>
          <Plus className="w-4 h-4 mr-2" />
          New Changelog
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader className="border-b">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Changes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changelogs.map((changelog) => {
              const isExpanded = expandedRows.has(changelog.id);
              const hasEntries =
                changelog.entries && changelog.entries.length > 0;
              const groupedEntries = hasEntries
                ? groupEntriesByType(changelog.entries)
                : {};

              return (
                <>
                  <TableRow
                    key={changelog.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(changelog.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Collapsible>
                        <CollapsibleTrigger className="p-1 hover:bg-muted rounded">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{changelog.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {changelog.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {changelog.version && (
                        <Badge variant="outline" className="text-xs">
                          {changelog.version}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(changelog.publishDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {hasEntries ? (
                        <Badge variant="secondary" className="text-xs">
                          {changelog.entries.length} items
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          changelog.isPublished ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {changelog.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddEntry(changelog)}
                          title="Add Entry"
                        >
                          <ListPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(changelog)}
                          title="Edit Changelog"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!changelog.isPublished && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(changelog.id)}
                            disabled={publishMutation.isPending}
                            title="Publish Changelog"
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => await handleDelete(changelog.id)}
                          disabled={deleteMutation.isPending}
                          title="Delete Changelog"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <Collapsible open={isExpanded}>
                          <CollapsibleContent className="p-6 bg-muted/20">
                            {hasEntries ? (
                              <div className="space-y-4">
                                {Object.entries(groupedEntries).map(
                                  ([type, entries]) => (
                                    <div key={type} className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-2 h-2 rounded-full ${getTypeColor(type)}`}
                                        />
                                        <span className="font-medium text-sm">
                                          {getTypeLabel(type)}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {entries.length}
                                        </Badge>
                                      </div>
                                      <div className="ml-4 space-y-1">
                                        {entries.map(
                                          (entry: any, index: number) => (
                                            <div
                                              key={entry.id || index}
                                              className="py-2 group"
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                  <div className="font-medium text-sm">
                                                    {entry.title}
                                                  </div>
                                                  {entry.description && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                      {entry.description}
                                                    </div>
                                                  )}
                                                  {(entry.issue ||
                                                    entry.feature) && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                      {entry.issue &&
                                                        `Issue: ${entry.issue.title}`}
                                                      {entry.issue &&
                                                        entry.feature &&
                                                        " • "}
                                                      {entry.feature &&
                                                        `Feature: ${entry.feature.name}`}
                                                    </div>
                                                  )}
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEntry(
                                                      entry.id,
                                                      entry.title
                                                    );
                                                  }}
                                                  disabled={
                                                    deleteEntryMutation.isPending
                                                  }
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                  title="Delete Entry"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No entries in this changelog
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingChangelog && (
        <ChangelogDialog
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
          roadmapId={roadmapId}
          editingChangelog={editingChangelog}
        />
      )}

      {/* Add Entry Dialog */}
      {addingEntryToChangelog && (
        <ChangelogEntryDialog
          isOpen={isEntryDialogOpen}
          onClose={handleEntryDialogClose}
          changelog={addingEntryToChangelog}
          roadmapId={roadmapId}
          projectId={projectId}
        />
      )}
    </div>
  );
}
