"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  GitBranch,
  Search,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAvailableRepositoriesForProject,
  connectRepositoryToProject,
} from "@/actions/integration/github-repository";

interface RepositoryConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
}

interface AvailableRepository {
  integrationId: string;
  integrationName: string;
  repositoryName: string;
  githubUsername: string;
}

export function RepositoryConnectionDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: RepositoryConnectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>(
    []
  );
  const queryClient = useQueryClient();

  const {
    data: availableRepos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-repositories", projectId],
    queryFn: () => getAvailableRepositoriesForProject(projectId),
    enabled: open,
  });

  const connectMutation = useMutation({
    mutationFn: async (
      repositories: { integrationId: string; repositoryName: string }[]
    ) => {
      const results = await Promise.allSettled(
        repositories.map((repo) =>
          connectRepositoryToProject(
            repo.integrationId,
            repo.repositoryName,
            projectId
          )
        )
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      return { successful, failed, total: repositories.length };
    },
    onSuccess: (result) => {
      if (result.successful > 0) {
        toast.success(
          `Successfully connected ${result.successful} repositor${result.successful === 1 ? "y" : "ies"}`
        );
      }
      if (result.failed > 0) {
        toast.error(
          `Failed to connect ${result.failed} repositor${result.failed === 1 ? "y" : "ies"}`
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["project-repositories", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["available-repositories", projectId],
      });
      onSuccess?.();
      onOpenChange(false);
      setSelectedRepositories([]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to connect repositories"
      );
    },
  });

  const repositories = availableRepos?.data || [];
  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.repositoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.githubUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepositoryToggle = (repositoryName: string) => {
    setSelectedRepositories((prev) =>
      prev.includes(repositoryName)
        ? prev.filter((name) => name !== repositoryName)
        : [...prev, repositoryName]
    );
  };

  const handleSelectAll = () => {
    if (selectedRepositories.length === filteredRepositories.length) {
      setSelectedRepositories([]);
    } else {
      setSelectedRepositories(
        filteredRepositories.map((repo) => repo.repositoryName)
      );
    }
  };

  const handleConnect = () => {
    const repositoriesToConnect = repositories
      .filter((repo) => selectedRepositories.includes(repo.repositoryName))
      .map((repo) => ({
        integrationId: repo.integrationId,
        repositoryName: repo.repositoryName,
      }));

    connectMutation.mutate(repositoriesToConnect);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Connect Repositories
          </DialogTitle>
          <DialogDescription>
            Select GitHub repositories to connect to this project for code
            analysis and tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search repositories</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by repository or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Select All */}
          {filteredRepositories.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    filteredRepositories.length > 0 &&
                    selectedRepositories.length === filteredRepositories.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Select All</Label>
              </div>
              <Badge variant="secondary" className="text-xs">
                {selectedRepositories.length} selected
              </Badge>
            </div>
          )}

          {/* Repository List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 border rounded animate-pulse"
                  >
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load repositories</p>
                <p className="text-xs mt-1">
                  {error instanceof Error
                    ? error.message
                    : "Unknown error occurred"}
                </p>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="h-8 w-8 mx-auto mb-2" />
                <p>No repositories available</p>
                <p className="text-xs mt-1">
                  Make sure you have GitHub integrations set up and repositories
                  selected.
                </p>
              </div>
            ) : filteredRepositories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>No repositories match your search</p>
              </div>
            ) : (
              filteredRepositories.map((repo) => (
                <div
                  key={repo.repositoryName}
                  className="flex items-start space-x-3 p-3 border rounded hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedRepositories.includes(repo.repositoryName)}
                    onCheckedChange={() =>
                      handleRepositoryToggle(repo.repositoryName)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">
                        {repo.repositoryName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {repo.integrationName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {repo.githubUsername}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <a
                        href={`https://github.com/${repo.repositoryName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on GitHub
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={connectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConnect}
            disabled={
              selectedRepositories.length === 0 || connectMutation.isPending
            }
          >
            {connectMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Connect {selectedRepositories.length} Repositor
                {selectedRepositories.length === 1 ? "y" : "ies"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
