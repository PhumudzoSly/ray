"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
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
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useData } from "@/hooks/use-data";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

const ROADMAP_STATUSES = [
  { id: "BACKLOG", label: "Backlog", color: "bg-gray-500", icon: AlertCircle },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-yellow-500",
    icon: Rocket,
  },
  { id: "REVIEW", label: "Review", color: "bg-purple-500", icon: Eye },
  { id: "DONE", label: "Done", color: "bg-green-500", icon: CheckCircle2 },
  { id: "BLOCKED", label: "Blocked", color: "bg-orange-500", icon: XCircle },
  { id: "CANCELLED", label: "Cancelled", color: "bg-red-500", icon: XCircle },
];

const SENTIMENT_OPTIONS = [
  {
    value: "positive",
    label: "Positive",
    icon: Smile,
    color: "text-green-600",
  },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-600" },
  { value: "negative", label: "Negative", icon: Frown, color: "text-red-600" },
];

interface RoadmapItemDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: Id<"roadmapItems"> | null;
}

export function RoadmapItemDetailsSheet({
  isOpen,
  onClose,
  itemId,
}: RoadmapItemDetailsSheetProps) {
  const { token } = useSession();
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackSentiment, setFeedbackSentiment] = useState<
    "positive" | "neutral" | "negative"
  >("neutral");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Fetch roadmap item details
  const { data: item, isPending: isLoadingItem } = useData(
    api.roadmap.items.getRoadmapItem,
    itemId ? { id: itemId, token } : "skip"
  );

  // Fetch feedback for the item
  const { data: feedback, isPending: isLoadingFeedback } = useData(
    api.roadmap.feedback.getFeedback,
    itemId ? { itemId, onlyApproved: true } : "skip"
  );

  // Mutations
  const addFeedback = useMutation(api.roadmap.feedback.addFeedback);
  const voteForItem = useMutation(api.roadmap.items.voteForItem);
  const removeVote = useMutation(api.roadmap.items.removeVote);

  if (!itemId) return null;

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await addFeedback({
        itemId,
        content: feedbackContent,
        sentiment: feedbackSentiment,
        ipAddress: "127.0.0.1", // In a real app, you'd get this from the server
      });
      toast.success("Feedback submitted successfully!");
      setFeedbackContent("");
      setFeedbackSentiment("neutral");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleVote = async () => {
    try {
      await voteForItem({
        itemId,
        ipAddress: "127.0.0.1", // In a real app, you'd get this from the server
      });
      toast.success("Vote added!");
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  if (isLoadingItem) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!item) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Item not found</h3>
              <p className="text-muted-foreground">
                The roadmap item you're looking for doesn't exist or has been
                deleted.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const statusInfo = ROADMAP_STATUSES.find((s) => s.id === item.status);
  const StatusIcon = statusInfo?.icon || AlertCircle;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${statusInfo?.color || "bg-gray-500"} text-white`}
                  variant="secondary"
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo?.label}
                </Badge>
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant={item.isPublic ? "default" : "secondary"}>
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
              </div>
              <SheetTitle className="text-xl">{item.title}</SheetTitle>
              <SheetDescription className="text-base">
                {item.description}
              </SheetDescription>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{item.voteCount}</span>
              <span className="text-sm text-muted-foreground">votes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{item.feedbackCount}</span>
              <span className="text-sm text-muted-foreground">feedback</span>
            </div>
            {item.targetDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Target: {new Date(item.targetDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Vote Button */}
          <div className="flex gap-2">
            <Button onClick={handleVote} variant="outline" size="sm">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Vote
            </Button>
          </div>
        </SheetHeader>

        <Separator className="my-6" />

        {/* Feedback Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Feedback & Comments</h3>
            <Badge variant="secondary">{feedback?.length || 0}</Badge>
          </div>

          {/* Add Feedback Form */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Add your feedback</span>
            </div>
            <Textarea
              placeholder="Share your thoughts about this roadmap item..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <Select
                value={feedbackSentiment}
                onValueChange={(value: "positive" | "neutral" | "negative") =>
                  setFeedbackSentiment(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SENTIMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback || !feedbackContent.trim()}
                size="sm"
              >
                {isSubmittingFeedback ? (
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit
              </Button>
            </div>
          </div>

          {/* Feedback List */}
          <ScrollArea className="h-[400px]">
            {isLoadingFeedback ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : feedback && feedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.map((fb) => {
                  const sentimentOption = SENTIMENT_OPTIONS.find(
                    (opt) => opt.value === fb.sentiment
                  );
                  const SentimentIcon = sentimentOption?.icon || Meh;

                  return (
                    <div
                      key={fb._id}
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
                            className={`${sentimentOption?.color || "text-gray-600"}`}
                          >
                            <SentimentIcon className="w-3 h-3 mr-1" />
                            {sentimentOption?.label}
                          </Badge>
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share your thoughts about this roadmap item.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
