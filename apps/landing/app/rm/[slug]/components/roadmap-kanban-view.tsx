import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  ThumbsUp,
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  Rocket,
  Clock,
  Circle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  voteCount: number;
  feedbackCount: number;
  targetDate?: number;
  updatedAt: number;
}

interface RoadmapKanbanViewProps {
  itemsByStatus: {
    REVIEW: RoadmapItem[];
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
  feedbackSentiment: "positive" | "neutral" | "negative";
  setFeedbackSentiment: (
    sentiment: "positive" | "neutral" | "negative"
  ) => void;
  handleVote: (itemId: string) => void;
  handleSubmitFeedback: () => void;
}

export function RoadmapKanbanView({
  itemsByStatus,
  selectedItemId,
  setSelectedItemId,
  feedbackContent,
  setFeedbackContent,
  feedbackSentiment,
  setFeedbackSentiment,
  handleVote,
  handleSubmitFeedback,
}: RoadmapKanbanViewProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "REVIEW":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "DONE":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      case "BACKLOG":
        return "bg-gray-500";
      case "BLOCKED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "REVIEW":
        return <Hourglass className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Rocket className="w-4 h-4" />;
      case "DONE":
        return <CheckCircle2 className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "BACKLOG":
        return <Circle className="w-4 h-4" />;

      case "BLOCKED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderColumn = (
    title: string,
    items: RoadmapItem[],
    statusKey: string,
    color: string
  ) => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <h3 className="font-medium">{title}</h3>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground">
            <p className="text-sm">No {title.toLowerCase()} items</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Badge
                    className={`${getStatusColor(item.status)} text-white flex-shrink-0`}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                    </span>
                  </Badge>
                  <Badge variant="outline">{item.category}</Badge>
                  {item.targetDate && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 ml-auto"
                    >
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.targetDate), "MMM yyyy")}
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{item.voteCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{item.feedbackCount}</span>
                    </div>
                  </div>
                  {statusKey === "done" || statusKey === "cancelled" ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {statusKey === "done" ? "Completed" : "Cancelled"}{" "}
                        {formatDistanceToNow(new Date(item.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => handleVote(item.id)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Vote
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Comment
                      </Button>
                    </div>
                  )}
                </div>

                {/* Feedback form */}
                {selectedItemId === item.id && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">
                      Add your feedback
                    </h4>
                    <Textarea
                      placeholder="Share your thoughts on this feature..."
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      className="mb-3 text-sm"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={
                            feedbackSentiment === "positive"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFeedbackSentiment("positive")}
                        >
                          Positive
                        </Button>
                        <Button
                          variant={
                            feedbackSentiment === "neutral"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFeedbackSentiment("neutral")}
                        >
                          Neutral
                        </Button>
                        <Button
                          variant={
                            feedbackSentiment === "negative"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFeedbackSentiment("negative")}
                        >
                          Negative
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItemId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSubmitFeedback}
                          disabled={!feedbackContent.trim()}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {renderColumn("Backlog", itemsByStatus.BACKLOG, "BACKLOG", "bg-gray-500")}
      {renderColumn("Review", itemsByStatus.REVIEW, "REVIEW", "bg-blue-500")}
      {renderColumn(
        "In Progress",
        itemsByStatus.IN_PROGRESS,
        "IN_PROGRESS",
        "bg-yellow-500"
      )}
      {renderColumn("Done", itemsByStatus.DONE, "DONE", "bg-green-500")}
      {renderColumn(
        "Cancelled",
        itemsByStatus.CANCELLED,
        "CANCELLED",
        "bg-red-500"
      )}
      {renderColumn("Blocked", itemsByStatus.BLOCKED, "BLOCKED", "bg-red-500")}
    </div>
  );
}
