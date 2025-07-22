"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import {
  getGitHubRepositories,
  updateGitHubRepositories,
  GitHubRepository,
} from "@/actions/integration/github";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

interface GitHubRepositoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationId: string;
  onSuccess: () => void;
}

export function GitHubRepositoryModal({
  open,
  onOpenChange,
  integrationId,
  onSuccess,
}: GitHubRepositoryModalProps) {
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: repositories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["github-repositories", integrationId],
    queryFn: () => getGitHubRepositories(integrationId),
    enabled: open && !!integrationId,
    retry: 2,
    retryDelay: 1000,
  });

  const mutation = useMutation({
    mutationFn: () => updateGitHubRepositories(integrationId, selectedRepos),
    onSuccess: () => {
      toast.success("Repositories updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update repositories");
    },
  });

  const filteredRepositories =
    repositories?.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleRepoToggle = (repoName: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repoName)
        ? prev.filter((name) => name !== repoName)
        : [...prev, repoName]
    );
  };

  const handleSelectAll = () => {
    if (filteredRepositories.length === selectedRepos.length) {
      setSelectedRepos([]);
    } else {
      setSelectedRepos(filteredRepositories.map((repo) => repo.full_name));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.57.69.47C19.13 20.58 22 16.76 22 12.26 22 6.58 17.52 2 12 2z" />
            </svg>
            Select Repositories
          </DialogTitle>
          <DialogDescription>
            Choose which repositories you want to connect and sync with your
            projects.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="search">Search repositories</Label>
            <Input
              id="search"
              placeholder="Search by repository name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  filteredRepositories.length > 0 &&
                  filteredRepositories.length === selectedRepos.length
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">Select All</Label>
            </div>
            <Badge variant="secondary">{selectedRepos.length} selected</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
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
                <p>Failed to load repositories</p>
                <p className="text-xs mt-1">
                  {error instanceof Error
                    ? error.message
                    : "Unknown error occurred"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredRepositories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No repositories found</p>
              </div>
            ) : (
              filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-start space-x-3 p-3 border rounded hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedRepos.includes(repo.full_name)}
                    onCheckedChange={() => handleRepoToggle(repo.full_name)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">
                        {repo.full_name}
                      </span>
                      {repo.private && (
                        <Badge variant="outline" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      {repo.language && <span>{repo.language}</span>}
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🔄 {repo.forks_count}</span>
                      <span>🐛 {repo.open_issues_count}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Updating..." : "Connect Repositories"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
