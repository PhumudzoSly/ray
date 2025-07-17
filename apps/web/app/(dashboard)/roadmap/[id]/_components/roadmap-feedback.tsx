"use client";

import { useState } from "react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  MessageSquare,
  Filter,
  Plus,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";

interface FeedbackItem {
  _id: Id<"roadmapFeedback">;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  isApproved: boolean;
  createdAt: number;
  convertedToFeatureId?: Id<"feature">;
  convertedToIssueId?: Id<"issues">;
  convertedAt?: number;
  convertedBy?: any;
  conversionNotes?: string;
  roadmapItem?: {
    _id: Id<"roadmapItems">;
    title: string;
    category: string;
  };
  convertedFeature?: {
    _id: Id<"feature">;
    name: string;
  };
  convertedIssue?: {
    _id: Id<"issues">;
    title: string;
  };
}

interface RoadmapFeedbackProps {
  feedback: FeedbackItem[];
  onRefresh?: () => void;
}

export function RoadmapFeedback({
  feedback = [],
  onRefresh,
}: RoadmapFeedbackProps) {
  const { token } = useSession();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
    null
  );
  const [conversionType, setConversionType] = useState<"feature" | "issue">(
    "feature"
  );
  const [showConversionDialog, setShowConversionDialog] = useState(false);

  // Feature form state
  const [featureForm, setFeatureForm] = useState({
    name: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    phase: "PLANNING" as
      | "PLANNING"
      | "DEVELOPMENT"
      | "TESTING"
      | "DEPLOYMENT"
      | "COMPLETED",
    notes: "",
  });

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    status: "BACKLOG" as
      | "BACKLOG"
      | "IN_PROGRESS"
      | "IN_REVIEW"
      | "DONE"
      | "CANCELLED",
    label: "FEATURE" as
      | "BUG"
      | "FEATURE"
      | "IMPROVEMENT"
      | "TASK"
      | "DOCUMENTATION",
    notes: "",
  });

  // Mutations
  // Removed: const convertToFeature = useMutation(
  // Removed:   api.roadmap.feedback.convertFeedbackToFeature
  // Removed: );
  // Removed: const convertToIssue = useMutation(
  // Removed:   api.roadmap.feedback.convertFeedbackToIssue
  // Removed: );
  // Removed: const moderateFeedback = useMutation(api.roadmap.feedback.moderateFeedback);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "border-l-green-500";
      case "negative":
        return "border-l-red-500";
      default:
        return "border-l-yellow-500";
    }
  };

  const handleConvert = async () => {
    if (!selectedFeedback || !token) return;

    try {
      if (conversionType === "feature") {
        if (!featureForm.name) {
          toast.error("Feature name is required");
          return;
        }

        // Removed: await convertToFeature({
        // Removed:   token,
        // Removed:   feedbackId: selectedFeedback._id,
        // Removed:   featureName: featureForm.name,
        // Removed:   featureDescription:
        // Removed:     featureForm.description || selectedFeedback.content,
        // Removed:   priority: featureForm.priority,
        // Removed:   phase: featureForm.phase,
        // Removed:   conversionNotes: featureForm.notes,
        // Removed: });

        toast.success("Feedback converted to feature successfully!");
      } else {
        if (!issueForm.title) {
          toast.error("Issue title is required");
          return;
        }

        // Removed: await convertToIssue({
        // Removed:   token,
        // Removed:   feedbackId: selectedFeedback._id,
        // Removed:   issueTitle: issueForm.title,
        // Removed:   issueDescription: issueForm.description || selectedFeedback.content,
        // Removed:   priority: issueForm.priority,
        // Removed:   status: issueForm.status,
        // Removed:   label: issueForm.label,
        // Removed:   conversionNotes: issueForm.notes,
        // Removed: });

        toast.success("Feedback converted to issue successfully!");
      }

      setShowConversionDialog(false);
      setSelectedFeedback(null);
      resetForms();
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to convert feedback");
    }
  };

  const handleApprove = async (
    feedbackId: Id<"roadmapFeedback">,
    approved: boolean
  ) => {
    if (!token) return;

    try {
      // Removed: await moderateFeedback({
      // Removed:   token,
      // Removed:   id: feedbackId,
      // Removed:   isApproved: approved,
      // Removed: });

      toast.success(
        `Feedback ${approved ? "approved" : "rejected"} successfully!`
      );
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to moderate feedback");
    }
  };

  const openConversionDialog = (
    feedback: FeedbackItem,
    type: "feature" | "issue"
  ) => {
    setSelectedFeedback(feedback);
    setConversionType(type);

    // Pre-fill forms with feedback content
    if (type === "feature") {
      setFeatureForm({
        name: `Feature: ${feedback.roadmapItem?.title || "New Feature"}`,
        description: feedback.content,
        priority: "MEDIUM",
        phase: "PLANNING",
        notes: "",
      });
    } else {
      setIssueForm({
        title: `Issue: ${feedback.roadmapItem?.title || "New Issue"}`,
        description: feedback.content,
        priority: "MEDIUM",
        status: "BACKLOG",
        label: "FEATURE",
        notes: "",
      });
    }

    setShowConversionDialog(true);
  };

  const resetForms = () => {
    setFeatureForm({
      name: "",
      description: "",
      priority: "MEDIUM",
      phase: "PLANNING",
      notes: "",
    });
    setIssueForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "BACKLOG",
      label: "FEATURE",
      notes: "",
    });
  };

  const unconvertedFeedback = feedback.filter(
    (f) => !f.convertedToFeatureId && !f.convertedToIssueId
  );
  const convertedFeedback = feedback.filter(
    (f) => f.convertedToFeatureId || f.convertedToIssueId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Feedback</h2>
          <p className="text-sm text-muted-foreground">
            {feedback.length} total feedback items •{" "}
            {unconvertedFeedback.length} pending • {convertedFeedback.length}{" "}
            converted
          </p>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No feedback yet</h3>
          <p className="text-muted-foreground mb-4">
            Feedback from users will appear here once they start commenting on
            your roadmap items.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({unconvertedFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="converted">
              Converted ({convertedFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({feedback.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {unconvertedFeedback.map((item) => (
              <Card
                key={item._id}
                className={`border-l-4 ${getSentimentColor(item.sentiment)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(item.sentiment)}
                      <CardTitle className="text-sm font-medium">
                        {item.roadmapItem?.title || "Unknown Item"}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {item.roadmapItem?.category}
                      </Badge>
                      {!item.isApproved && (
                        <Badge variant="secondary" className="text-xs">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.isApproved && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(item._id, true)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(item._id, false)}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openConversionDialog(item, "feature")}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Feature
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConversionDialog(item, "issue")}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Issue
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()} at{" "}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="converted" className="space-y-4 mt-6">
            {convertedFeedback.map((item) => (
              <Card
                key={item._id}
                className={`border-l-4 ${getSentimentColor(item.sentiment)} opacity-75`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(item.sentiment)}
                      <CardTitle className="text-sm font-medium">
                        {item.roadmapItem?.title || "Unknown Item"}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {item.roadmapItem?.category}
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Converted
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.convertedToFeatureId && (
                        <Badge variant="secondary" className="text-xs">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Feature: {item.convertedFeature?.name}
                        </Badge>
                      )}
                      {item.convertedToIssueId && (
                        <Badge variant="secondary" className="text-xs">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Issue: {item.convertedIssue?.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    {item.convertedAt && (
                      <span>
                        Converted on{" "}
                        {new Date(item.convertedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {item.conversionNotes && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <strong>Conversion Notes:</strong> {item.conversionNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {feedback.map((item) => (
              <Card
                key={item._id}
                className={`border-l-4 ${getSentimentColor(item.sentiment)} ${item.convertedToFeatureId || item.convertedToIssueId ? "opacity-75" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(item.sentiment)}
                      <CardTitle className="text-sm font-medium">
                        {item.roadmapItem?.title || "Unknown Item"}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {item.roadmapItem?.category}
                      </Badge>
                      {!item.isApproved && (
                        <Badge variant="secondary" className="text-xs">
                          Pending Approval
                        </Badge>
                      )}
                      {(item.convertedToFeatureId ||
                        item.convertedToIssueId) && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Converted
                          </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.convertedToFeatureId &&
                        !item.convertedToIssueId && (
                          <>
                            {!item.isApproved && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(item._id, true)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(item._id, false)}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              onClick={() =>
                                openConversionDialog(item, "feature")
                              }
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Feature
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openConversionDialog(item, "issue")
                              }
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Issue
                            </Button>
                          </>
                        )}
                      {item.convertedToFeatureId && (
                        <Badge variant="secondary" className="text-xs">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Feature: {item.convertedFeature?.name}
                        </Badge>
                      )}
                      {item.convertedToIssueId && (
                        <Badge variant="secondary" className="text-xs">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Issue: {item.convertedIssue?.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    {item.convertedAt && (
                      <span>
                        Converted on{" "}
                        {new Date(item.convertedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {item.conversionNotes && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <strong>Conversion Notes:</strong> {item.conversionNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Conversion Dialog */}
      <Dialog
        open={showConversionDialog}
        onOpenChange={setShowConversionDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Convert Feedback to{" "}
              {conversionType === "feature" ? "Feature" : "Issue"}
            </DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Original Feedback</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Item:</strong> {selectedFeedback.roadmapItem?.title}
                </p>
                <p className="text-sm">{selectedFeedback.content}</p>
              </div>

              {conversionType === "feature" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="featureName">Feature Name *</Label>
                    <Input
                      id="featureName"
                      value={featureForm.name}
                      onChange={(e) =>
                        setFeatureForm({ ...featureForm, name: e.target.value })
                      }
                      placeholder="Enter feature name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="featureDescription">Description</Label>
                    <Textarea
                      id="featureDescription"
                      value={featureForm.description}
                      onChange={(e) =>
                        setFeatureForm({
                          ...featureForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Feature description (will use feedback content if empty)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="featurePriority">Priority</Label>
                      <Select
                        value={featureForm.priority}
                        onValueChange={(value: any) =>
                          setFeatureForm({ ...featureForm, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="featurePhase">Phase</Label>
                      <Select
                        value={featureForm.phase}
                        onValueChange={(value: any) =>
                          setFeatureForm({ ...featureForm, phase: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNING">Planning</SelectItem>
                          <SelectItem value="DEVELOPMENT">
                            Development
                          </SelectItem>
                          <SelectItem value="TESTING">Testing</SelectItem>
                          <SelectItem value="DEPLOYMENT">Deployment</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="featureNotes">Conversion Notes</Label>
                    <Textarea
                      id="featureNotes"
                      value={featureForm.notes}
                      onChange={(e) =>
                        setFeatureForm({
                          ...featureForm,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Add any notes about this conversion"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="issueTitle">Issue Title *</Label>
                    <Input
                      id="issueTitle"
                      value={issueForm.title}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, title: e.target.value })
                      }
                      placeholder="Enter issue title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="issueDescription">Description</Label>
                    <Textarea
                      id="issueDescription"
                      value={issueForm.description}
                      onChange={(e) =>
                        setIssueForm({
                          ...issueForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Issue description (will use feedback content if empty)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="issuePriority">Priority</Label>
                      <Select
                        value={issueForm.priority}
                        onValueChange={(value: any) =>
                          setIssueForm({ ...issueForm, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="issueStatus">Status</Label>
                      <Select
                        value={issueForm.status}
                        onValueChange={(value: any) =>
                          setIssueForm({ ...issueForm, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BACKLOG">Backlog</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In Progress
                          </SelectItem>
                          <SelectItem value="IN_REVIEW">In Review</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="issueLabel">Label</Label>
                      <Select
                        value={issueForm.label}
                        onValueChange={(value: any) =>
                          setIssueForm({ ...issueForm, label: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUG">Bug</SelectItem>
                          <SelectItem value="FEATURE">Feature</SelectItem>
                          <SelectItem value="IMPROVEMENT">
                            Improvement
                          </SelectItem>
                          <SelectItem value="TASK">Task</SelectItem>
                          <SelectItem value="DOCUMENTATION">
                            Documentation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="issueNotes">Conversion Notes</Label>
                    <Textarea
                      id="issueNotes"
                      value={issueForm.notes}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, notes: e.target.value })
                      }
                      placeholder="Add any notes about this conversion"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConversionDialog(false);
                    setSelectedFeedback(null);
                    resetForms();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleConvert}>
                  Convert to{" "}
                  {conversionType === "feature" ? "Feature" : "Issue"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
