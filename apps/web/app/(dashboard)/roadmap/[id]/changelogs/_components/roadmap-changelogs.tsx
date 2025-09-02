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
import { Plus, Edit, Globe, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import NoData from "@/components/shared/no-data";
import {
  updateRoadmapChangelog,
  deleteRoadmapChangelog,
} from "@/actions/roadmap/changelogs";
import { ChangelogDialog } from "./changelog-dialog";
import { ChangelogDetailSheet } from "./changelog-detail-sheet";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";

interface RoadmapChangelogsProps {
  changelogs: any[];
  onCreateChangelog: () => void;
  roadmapId: string;
  projectId: string;
}

export function RoadmapChangelogs({
  changelogs,
  onCreateChangelog,
  roadmapId,
  projectId,
}: RoadmapChangelogsProps) {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [editingChangelog, setEditingChangelog] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedChangelog, setSelectedChangelog] = useState<any>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

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

  // Handle edit
  const handleEdit = (changelog: any) => {
    setEditingChangelog(changelog);
    setIsEditDialogOpen(true);
  };

  // Handle publish
  const handlePublish = (changelogId: string) => {
    publishMutation.mutate(changelogId);
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

  // Handle open detail sheet
  const handleOpenDetail = (changelog: any) => {
    setSelectedChangelog(changelog);
    setIsDetailSheetOpen(true);
  };

  // Handle close detail sheet
  const handleCloseDetailSheet = () => {
    setSelectedChangelog(null);
    setIsDetailSheetOpen(false);
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setEditingChangelog(null);
    setIsEditDialogOpen(false);
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
              <TableHead className="w-20">Version</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28 text-right">Date</TableHead>
              <TableHead className="w-20 text-right">Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changelogs.map((changelog) => (
              <TableRow
                key={changelog.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOpenDetail(changelog)}
              >
                <TableCell>
                  {changelog.version && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {changelog.version}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium truncate pr-4">
                    {changelog.title}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {format(new Date(changelog.publishDate), "MMM d")}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={changelog.isPublished ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {changelog.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  className="text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(changelog);
                      }}
                      title="Edit Changelog"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!changelog.isPublished && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(changelog.id);
                        }}
                        disabled={publishMutation.isPending}
                        title="Publish Changelog"
                        className="h-8 w-8 p-0"
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleDelete(changelog.id);
                      }}
                      disabled={deleteMutation.isPending}
                      title="Delete Changelog"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
}
