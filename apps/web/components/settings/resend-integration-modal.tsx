"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createResendIntegration,
  getResendIntegrations,
  deleteResendIntegrationById,
} from "@/actions/integration/resend-actions";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Separator } from "@workspace/ui/components/separator";
import { Plus, Trash2, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResendIntegrationModal({
  isOpen,
  onClose,
}: ResendIntegrationModalProps) {
  const queryClient = useQueryClient();
  const session = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    audienceId: "",
  });

  // Fetch all Resend integrations
  const {
    data: resendIntegrations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["integrations", "resend", session.org],
    queryFn: async () => {
      if (!session?.org) {
        throw new Error(
          "No active organization found. Please select an organization."
        );
      }
      return await getResendIntegrations();
    },
    enabled: isOpen && !!session?.org,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (
        error.message.includes("organization") ||
        error.message.includes("authentication")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Create new Resend integration
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      config: { apiKey: string; audienceId?: string };
    }) => {
      return await createResendIntegration(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations", "resend", session.org],
      });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Resend integration created successfully");
      setShowAddForm(false);
      setFormData({ name: "", apiKey: "", audienceId: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create integration");
    },
  });

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      return await deleteResendIntegrationById(integrationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations", "resend", session.org],
      });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete integration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.apiKey.trim()) {
      toast.error("Name and API key are required");
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      config: {
        apiKey: formData.apiKey.trim(),
        audienceId: formData.audienceId.trim() || undefined,
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Integrations
          </SheetTitle>
          <SheetDescription>
            Manage your Resend email service integrations. You can have multiple
            Resend integrations for different purposes.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Add New Integration Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Active Integrations ({resendIntegrations?.length || 0})
            </h3>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </div>

          {/* Add New Integration Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Add New Resend Integration
                </CardTitle>
                <CardDescription>
                  Create a new Resend integration with your API key.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Integration Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Marketing Emails, Transactional"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="re_..."
                      value={formData.apiKey}
                      onChange={(e) =>
                        setFormData({ ...formData, apiKey: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audienceId">Audience ID (Optional)</Label>
                    <Input
                      id="audienceId"
                      placeholder="Audience ID for this integration"
                      value={formData.audienceId}
                      onChange={(e) =>
                        setFormData({ ...formData, audienceId: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1"
                    >
                      {createMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Integration
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ name: "", apiKey: "", audienceId: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Existing Integrations */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">
                  {error.message || "Failed to load integrations"}
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["integrations", "resend", session.org],
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            ) : !resendIntegrations || resendIntegrations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No Resend integrations found
                </p>
                <p className="text-sm text-muted-foreground">
                  Add your first Resend integration to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resendIntegrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell className="font-medium">
                        {integration.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(integration.createdAt)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Integration
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the integration
                                "{integration.name}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(integration.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
