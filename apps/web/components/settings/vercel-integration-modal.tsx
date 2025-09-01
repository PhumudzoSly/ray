"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/context/session-context";
import {
  createVercelIntegration,
  getVercelIntegration,
  deleteVercelIntegration,
} from "@/actions/integration/vercel-actions";
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
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { PasswordInput } from "@workspace/ui/components/password-input";

interface VercelIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VercelIntegrationModal({
  isOpen,
  onClose,
}: VercelIntegrationModalProps) {
  const session = useSession();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");

  const { data: vercelIntegration, isLoading } = useQuery({
    queryKey: ["integrations", "vercel", session.org],
    queryFn: async () => {
      return await getVercelIntegration();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return await createVercelIntegration({ config: { apiKey } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations", "vercel", session.org],
      });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Vercel integration created successfully");
      setApiKey("");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create integration");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!vercelIntegration?.id) return;
      return await deleteVercelIntegration(vercelIntegration.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations", "vercel", session.org],
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
    if (!apiKey.trim()) {
      toast.error("API key is required");
      return;
    }
    createMutation.mutate(apiKey.trim());
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="text-xl">▲</div>
            Vercel Integration
          </SheetTitle>
          <SheetDescription>
            Manage your Vercel integration. You can only have Vercel integration
            per Organization.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <LoadingSpinner variant="card" />
        ) : (
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {vercelIntegration
                    ? "Vercel API Key"
                    : "Add Vercel Integration"}
                </CardTitle>
                <CardDescription>
                  {vercelIntegration
                    ? "Your Vercel integration is active."
                    : "Create a new Vercel integration with your API key."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key *</Label>
                    <PasswordInput
                      id="apiKey"
                      placeholder={
                        vercelIntegration
                          ? "••••••••••••••••••••"
                          : "Your Vercel API key"
                      }
                      value={apiKey}
                      onChange={(e: any) => setApiKey(e.target.value)}
                      required
                      disabled={!!vercelIntegration}
                    />
                    {vercelIntegration ? null : (
                      <p className="text-sm text-muted-foreground mt-6">
                        To get your Vercel API key:
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                          <li>
                            Go to your{" "}
                            <a
                              className="underline"
                              href="https://vercel.com"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Vercel
                            </a>{" "}
                            account settings
                          </li>
                          <li>Navigate to the &quot;Tokens&quot; section</li>
                          <li>
                            Click &quot;Create&quot; and give your token a name
                          </li>
                          <li>
                            Select &quot;All&quot; scopes or the minimum
                            required permissions
                          </li>
                          <li>Copy the generated token and paste it above</li>
                        </ol>
                        <span className="text-sm font-medium text-amber-500 mt-2 block">
                          Note: The token will only be shown once, so make sure
                          to copy it before leaving the page.
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    {!vercelIntegration ? (
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || isLoading}
                        className="flex-1"
                      >
                        {createMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Create Integration
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Integration
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Integration
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the Vercel
                              integration? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
