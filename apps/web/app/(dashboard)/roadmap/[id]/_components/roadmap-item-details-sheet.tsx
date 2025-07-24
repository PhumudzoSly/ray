"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as roadmapItemActions from "@/actions/roadmap/items";
import * as roadmapFeedbackActions from "@/actions/roadmap/feedback";
import * as roadmapVoteActions from "@/actions/roadmap/votes";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent } from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
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
import {
  ThumbsUp,
  MessageSquare,
  Calendar,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Rocket,
  User,
  Smile,
  Meh,
  Frown,
  Trash2,
  MoreHorizontal,
  BarChart3,
  Target,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Square,
  Edit,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import { DateInput } from "@workspace/ui/components/date-input";
import { CommandSelect } from "@workspace/ui/components/command-select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

const ROADMAP_STATUS_OPTIONS = [
  {
    value: "BACKLOG",
    label: "Backlog",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: <Rocket className="h-3 w-3" />,
  },
  {
    value: "IN_REVIEW",
    label: "In Review",
    icon: <Eye className="h-3 w-3" />,
  },
  {
    value: "DONE",
    label: "Done",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  {
    value: "BLOCKED",
    label: "Blocked",
    icon: <XCircle className="h-3 w-3" />,
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "CRITICAL",
    label: "Critical",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  {
    value: "HIGH",
    label: "High",
    icon: <TrendingUp className="h-3 w-3" />,
  },
  {
    value: "MEDIUM",
    label: "Medium",
    icon: <Target className="h-3 w-3" />,
  },
  {
    value: "LOW",
    label: "Low",
    icon: <Activity className="h-3 w-3" />,
  },
];

const CATEGORY_OPTIONS = [
  { value: "UI", label: "UI" },
  { value: "BUG", label: "Bug" },
  { value: "FEATURE", label: "Feature" },
  { value: "IMPROVEMENT", label: "Improvement" },
  { value: "TASK", label: "Task" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "REFACTOR", label: "Refactor" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "DESIGN", label: "Design" },
  { value: "SECURITY", label: "Security" },
  { value: "ACCESSIBILITY", label: "Accessibility" },
  { value: "TESTING", label: "Testing" },
  { value: "INTERNATIONALIZATION", label: "Internationalization" },
];

interface RoadmapItemDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
}

export function RoadmapItemDetailsSheet({
  isOpen,
  onClose,
  itemId,
}: RoadmapItemDetailsSheetProps) {
  const { token } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const queryClient = useQueryClient();

  // Fetch roadmap item details with all related data
  const { data: item, isLoading } = useQuery({
    queryKey: ["roadmapItemDetails", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const result = await roadmapItemActions.getRoadmapItemWithDetails(itemId);
      return result.success ? result.data : null;
    },
    enabled: !!itemId,
  });

  // Optimistic update for roadmap item
  const updateMutation = useMutation({
    mutationFn: async (updates: any) =>
      roadmapItemActions.updateRoadmapItem(itemId!, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({
        queryKey: ["roadmapItemDetails", itemId],
      });
      const previous = queryClient.getQueryData(["roadmapItemDetails", itemId]);
      queryClient.setQueryData(["roadmapItemDetails", itemId], (old: any) => ({
        ...old,
        ...updates,
      }));
      return { previous };
    },
    onError: (err, updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["roadmapItemDetails", itemId],
          context.previous
        );
      }
      toast.error("Failed to update roadmap item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["roadmapItemDetails", itemId],
      });
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
    },
    onSuccess: () => {
      toast.success("Roadmap item updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => roadmapItemActions.deleteRoadmapItem(itemId!),
    onSuccess: () => {
      toast.success("Roadmap item deleted");
      queryClient.invalidateQueries({
        queryKey: ["roadmapItemDetails", itemId],
      });
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to delete roadmap item";
      toast.error(errorMessage);
    },
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async (data: any) =>
      roadmapFeedbackActions.createRoadmapFeedback(data),
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      setFeedbackContent("");
      queryClient.invalidateQueries({
        queryKey: ["roadmapItemDetails", itemId],
      });
    },
    onError: () => {
      toast.error("Failed to submit feedback");
    },
  });

  const voteForItemMutation = useMutation({
    mutationFn: async (data: any) => roadmapVoteActions.createRoadmapVote(data),
    onSuccess: () => {
      toast.success("Vote added!");
      queryClient.invalidateQueries({
        queryKey: ["roadmapItemDetails", itemId],
      });
    },
    onError: () => {
      toast.error("Failed to vote");
    },
  });

  const handleUpdate = async (updates: any) => {
    if (!item) return;
    setIsUpdating(true);
    updateMutation.mutate(updates, {
      onSettled: () => setIsUpdating(false),
    });
  };

  const handleStatusChange = async (status: string) => {
    await handleUpdate({ status });
  };

  const handlePriorityChange = async (priority: string) => {
    await handleUpdate({ priority });
  };

  const handleCategoryChange = async (category: string) => {
    await handleUpdate({ category });
  };

  const handleTargetDateChange = async (date: Date | undefined) => {
    await handleUpdate({
      targetDate: date ? date.getTime() : undefined,
    });
  };

  const handleTitleChange = async (title: string) => {
    await handleUpdate({ title });
  };

  const handleDescriptionChange = async (description: string) => {
    await handleUpdate({ description: description || undefined });
  };

  const handleVisibilityChange = async (isPublic: boolean) => {
    await handleUpdate({ isPublic });
  };

  const handleDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    deleteMutation.mutate(undefined, {
      onSettled: () => setIsDeleting(false),
    });
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || !itemId) {
      toast.error("Please enter your feedback");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await addFeedbackMutation.mutateAsync({
        roadmapItemId: itemId,
        content: feedbackContent,
        sentiment: "neutral", // Default sentiment, will be analyzed in background
        ipAddress: "127.0.0.1",
        isApproved: true,
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleVote = async () => {
    if (!itemId) return;
    try {
      await voteForItemMutation.mutateAsync({
        roadmapItemId: itemId,
        ipAddress: "127.0.0.1",
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (isLoading || !item) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[640px] p-0">
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-7 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <InlineEditField
                    displayValue={
                      <h1 className="text-xl font-semibold text-foreground leading-tight">
                        {item.title}
                      </h1>
                    }
                    value={item.title}
                    onSave={handleTitleChange}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.isPublic ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.isPublic ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVote}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {item.voteCount}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete roadmap item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.title}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Description</h3>
            <InlineEditTextArea
              value={item.description || ""}
              placeholder="Add a description..."
              onSave={handleDescriptionChange}
              disabled={isUpdating}
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>

          {/* Overdue alert */}
          {item.isOverdue && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle>Item is overdue</AlertTitle>
              <AlertDescription>
                This item's target date has passed and it is not marked as done.
              </AlertDescription>
            </Alert>
          )}

          {/* Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Properties</h3>
            <div className="grid grid-cols-[120px_1fr] gap-y-4">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <CommandSelect
                options={ROADMAP_STATUS_OPTIONS}
                value={item.status}
                onValueChange={handleStatusChange}
                placeholder="Select status"
                disabled={isUpdating}
                variant="status"
                size="sm"
              />

              <span className="text-xs font-medium text-muted-foreground">
                Priority
              </span>
              <CommandSelect
                options={PRIORITY_OPTIONS}
                value={item.priority}
                onValueChange={handlePriorityChange}
                placeholder="Select priority"
                disabled={isUpdating}
                variant="status"
                size="sm"
              />

              <span className="text-xs font-medium text-muted-foreground">
                Category
              </span>
              <CommandSelect
                options={CATEGORY_OPTIONS}
                value={item.category}
                onValueChange={handleCategoryChange}
                placeholder="Select category"
                disabled={isUpdating}
                variant="status"
                size="sm"
              />

              <span className="text-xs font-medium text-muted-foreground">
                Target Date
              </span>
              <DateInput
                value={item.targetDate ? new Date(item.targetDate) : undefined}
                placeholder="Set target date"
                onChange={handleTargetDateChange}
                disabled={isUpdating}
              />

              <span className="text-xs font-medium text-muted-foreground">
                Visibility
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVisibilityChange(!item.isPublic)}
                disabled={isUpdating}
                className="justify-start"
              >
                {item.isPublic ? (
                  <>
                    <Eye className="w-3 h-3 mr-2" />
                    Public
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-2" />
                    Private
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Progress
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {item.progress}%
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Votes
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {item.voteCount}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Feedback
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {item.feedbackCount}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Positive
                  </span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {item.positiveFeedbackCount}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Feedback & Comments
            </h3>

            {/* Add Feedback Form */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add your feedback</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                💡 Your feedback will be automatically analyzed for sentiment to
                help us better understand your experience.
              </div>
              <Textarea
                placeholder="Share your thoughts about this roadmap item..."
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-end gap-2 mt-3">
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || !feedbackContent.trim()}
                  size="sm"
                >
                  {isSubmittingFeedback ? (
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit
                </Button>
              </div>
            </div>

            {/* Feedback List */}
            <ScrollArea className="h-[400px]">
              {item.feedback && item.feedback.length > 0 ? (
                <div className="space-y-4">
                  {item.feedback.map((fb: any) => {
                    const getSentimentIcon = (sentiment: string) => {
                      switch (sentiment) {
                        case "positive":
                          return <Smile className="w-3 h-3 text-green-600" />;
                        case "negative":
                          return <Frown className="w-3 h-3 text-red-600" />;
                        default:
                          return <Meh className="w-3 h-3 text-gray-600" />;
                      }
                    };

                    const getSentimentColor = (sentiment: string) => {
                      switch (sentiment) {
                        case "positive":
                          return "text-green-600";
                        case "negative":
                          return "text-red-600";
                        default:
                          return "text-gray-600";
                      }
                    };

                    return (
                      <div
                        key={fb.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {fb.userId ? "U" : "A"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {fb.userId ? "User" : "Anonymous"}
                            </span>
                            <Badge
                              variant="outline"
                              className={getSentimentColor(fb.sentiment)}
                            >
                              {getSentimentIcon(fb.sentiment)}
                              <span className="ml-1 capitalize">
                                {fb.sentiment}
                              </span>
                            </Badge>
                            {!fb.isApproved && (
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(fb.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-8">
                          {fb.content}
                        </p>
                        {(fb.convertedToFeatureId || fb.convertedToIssueId) && (
                          <div className="pl-8 pt-2">
                            <Badge variant="outline" className="text-xs">
                              {fb.convertedToFeatureId
                                ? "Converted to Feature"
                                : "Converted to Issue"}
                            </Badge>
                            {fb.conversionNotes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {fb.conversionNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No feedback yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to share your thoughts about this roadmap item.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
