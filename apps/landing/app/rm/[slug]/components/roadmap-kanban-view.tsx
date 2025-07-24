import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { ThumbsUp, MessageSquare, Calendar, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { FeedbackModal } from "./feedback-modal";
import {
  BacklogIcon,
  InProgressIcon,
  ReviewIcon,
  DoneIcon,
  BlockedIcon,
} from "./roadmap-status-icons";
import { CategoryIcon, categoryConfig } from "./roadmap-category-icons";

// Priority configuration
const priorityConfig = {
  CRITICAL: {
    name: "Critical",
    colorClass: "text-red-500",
  },
  HIGH: {
    name: "High",
    colorClass: "text-orange-500",
  },
  MEDIUM: {
    name: "Medium",
    colorClass: "text-yellow-500",
  },
  LOW: {
    name: "Low",
    colorClass: "text-green-500",
  },
};

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  voteCount: number;
  feedbackCount: number;
  targetDate?: number;
  updatedAt: number;
}

interface RoadmapGroup {
  id: string;
  title: string;
  color: string;
  items: RoadmapItem[];
  count: number;
}

interface RoadmapKanbanViewProps {
  itemsByStatus: {
    IN_REVIEW: RoadmapItem[];
    IN_PROGRESS: RoadmapItem[];
    DONE: RoadmapItem[];
    CANCELLED: RoadmapItem[];
    BLOCKED: RoadmapItem[];
    BACKLOG: RoadmapItem[];
  };
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  feedbackContent: string;
  setFeedbackContent: (content: string) => void;
  handleVote: (itemId: string) => void;
  handleSubmitFeedback: () => void;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
}

// Status configuration with colors and labels
const statusConfig = {
  BACKLOG: {
    icon: BacklogIcon,
    label: "Backlog",
    iconColor: "text-muted-foreground",
    background: "bg-muted-foreground/5",
  },
  IN_REVIEW: {
    icon: ReviewIcon,
    label: "In Review",
    iconColor: "text-blue-500",
    background: "bg-blue-500/5",
  },
  IN_PROGRESS: {
    icon: InProgressIcon,
    label: "In Progress",
    iconColor: "text-yellow-500",
    background: "bg-yellow-500/5",
  },
  DONE: {
    icon: DoneIcon,
    label: "Completed",
    iconColor: "text-green-500",
    background: "bg-green-500/5",
  },
  CANCELLED: {
    icon: DoneIcon,
    label: "Cancelled",
    iconColor: "text-muted-foreground",
    background: "bg-muted-500/5",
  },
  BLOCKED: {
    icon: BlockedIcon,
    label: "Blocked",
    iconColor: "text-red-500",
    background: "bg-red-500/5",
  },
};

function RoadmapItemComponent({
  item,
  onVote,
  onComment,
  className,
}: {
  item: RoadmapItem;
  onVote: (itemId: string) => void;
  onComment: (itemId: string) => void;
  className?: string;
}) {
  const isCompleted = item.status === "DONE" || item.status === "CANCELLED";

  return (
    <div
      className={cn(
        "group w-full py-3 px-4 hover:bg-accent/50 cursor-pointer transition-colors duration-150 border-b last:border-0",
        className
      )}
    >
      {/* Mobile-first layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            {/* Header with title and badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-sm font-medium text-foreground leading-tight">
                {item.title}
              </h3>

              {/* Badges row - wrap on mobile */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="text-xs flex items-center gap-1 shrink-0"
                >
                  <CategoryIcon
                    categoryId={item.category}
                    className="w-3 h-3"
                  />
                  <span className="hidden sm:inline">
                    {categoryConfig[
                      item.category as keyof typeof categoryConfig
                    ]?.label || item.category}
                  </span>
                  <span className="sm:hidden">
                    {categoryConfig[
                      item.category as keyof typeof categoryConfig
                    ]?.label?.split(" ")[0] || item.category}
                  </span>
                </Badge>

                {item.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0",
                      priorityConfig[
                        item.priority as keyof typeof priorityConfig
                      ]?.colorClass
                    )}
                  >
                    <span className="hidden sm:inline">
                      {priorityConfig[
                        item.priority as keyof typeof priorityConfig
                      ]?.name || item.priority}
                    </span>
                    <span className="sm:hidden">
                      {priorityConfig[
                        item.priority as keyof typeof priorityConfig
                      ]?.name?.charAt(0) || item.priority}
                    </span>
                  </Badge>
                )}

                {item.targetDate && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>
                      Target: {format(new Date(item.targetDate), "dd MMM yyyy")}
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs mt-1 text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Bottom row with metadata and actions */}
          <div className="flex items-center gap-3">
            {/* Left side: Vote and comment counts */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{item.voteCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{item.feedbackCount}</span>
              </div>
            </div>

            {/* Right side: Timestamp or Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Timestamp for completed items */}
              {isCompleted && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {item.status === "DONE" ? "Completed" : "Cancelled"}{" "}
                    {formatDistanceToNow(new Date(item.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="sm:hidden">
                    {item.status === "DONE" ? "Done" : "Cancelled"}
                  </span>
                </div>
              )}

              {/* Action buttons for non-completed items */}
              {!isCompleted && (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(item.id);
                    }}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComment(item.id);
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Comment
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapGroupComponent({
  group,
  onVote,
  onComment,
  className,
}: {
  group: RoadmapGroup;
  onVote: (itemId: string) => void;
  onComment: (itemId: string) => void;
  className?: string;
}) {
  const statusInfo = statusConfig[group.id as keyof typeof statusConfig] || {
    icon: BacklogIcon,
    label: group.title,
    iconColor: "text-muted-foreground",
    background: "bg-muted-foreground/5",
  };

  const StatusIcon = statusInfo.icon;

  return (
    <div className={cn("border-t", className)}>
      {/* Group header */}
      <div
        className={cn(
          "sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b py-3 px-4",
          statusInfo.background
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", statusInfo.iconColor)} />
            <span className="text-sm font-medium text-foreground">
              {statusInfo.label}
            </span>
            <Badge variant="secondary" className="text-xs">
              {group.count}
            </Badge>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="w-full">
        {group.items.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-muted-foreground">
            <p className="text-sm">No {statusInfo.label.toLowerCase()} items</p>
          </div>
        ) : (
          <div className="space-y-0">
            {group.items.map((item) => (
              <RoadmapItemComponent
                key={item.id}
                item={item}
                onVote={onVote}
                onComment={onComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RoadmapKanbanView({
  itemsByStatus,
  selectedItemId,
  setSelectedItemId,
  feedbackContent,
  setFeedbackContent,
  handleVote,
  handleSubmitFeedback,
  isFeedbackModalOpen,
  setIsFeedbackModalOpen,
}: RoadmapKanbanViewProps) {
  // Convert itemsByStatus to grouped format
  const groupedItems: RoadmapGroup[] = [
    {
      id: "BACKLOG",
      title: "Backlog",
      color: "text-muted-foreground",
      items: itemsByStatus.BACKLOG,
      count: itemsByStatus.BACKLOG.length,
    },
    {
      id: "IN_REVIEW",
      title: "In Review",
      color: "text-blue-500",
      items: itemsByStatus.IN_REVIEW,
      count: itemsByStatus.IN_REVIEW.length,
    },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      color: "text-yellow-500",
      items: itemsByStatus.IN_PROGRESS,
      count: itemsByStatus.IN_PROGRESS.length,
    },
    {
      id: "DONE",
      title: "Completed",
      color: "text-green-500",
      items: itemsByStatus.DONE,
      count: itemsByStatus.DONE.length,
    },
    {
      id: "CANCELLED",
      title: "Cancelled",
      color: "text-muted-foreground",
      items: itemsByStatus.CANCELLED,
      count: itemsByStatus.CANCELLED.length,
    },
    {
      id: "BLOCKED",
      title: "Blocked",
      color: "text-red-500",
      items: itemsByStatus.BLOCKED,
      count: itemsByStatus.BLOCKED.length,
    },
  ].filter((group) => group.count > 0); // Only show groups with items

  const handleVoteClick = (itemId: string) => {
    handleVote(itemId);
  };

  const handleCommentClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsFeedbackModalOpen(true);
  };

  const selectedItem = selectedItemId
    ? Object.values(itemsByStatus)
        .flat()
        .find((item) => item.id === selectedItemId)
    : null;

  // Check if there are any items at all
  const totalItems = Object.values(itemsByStatus).reduce(
    (sum, items) => sum + items.length,
    0
  );

  // Show empty state if no items exist
  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center">
          Nothing planned yet
        </h3>
        <p className="text-muted-foreground text-center max-w-md text-sm sm:text-base">
          This roadmap is empty. Check back soon for updates on upcoming
          features and improvements.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {groupedItems.map((group) => (
          <RoadmapGroupComponent
            key={group.id}
            group={group}
            onVote={handleVoteClick}
            onComment={handleCommentClick}
          />
        ))}
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedItemId(null);
        }}
        itemTitle={selectedItem?.title || ""}
        feedbackContent={feedbackContent}
        setFeedbackContent={setFeedbackContent}
        handleSubmitFeedback={handleSubmitFeedback}
      />
    </>
  );
}
