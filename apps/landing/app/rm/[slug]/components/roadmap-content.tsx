import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
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
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Circle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { RoadmapKanbanView } from "./roadmap-kanban-view";
import { FeatureRequestDialog } from "./feature-request-dialog";

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

interface ChangelogItem {
  title: string;
  description: string;
  status: string;
}

interface Changelog {
  id: string;
  title: string;
  description: string;
  publishDate: number;
  items: ChangelogItem[];
}

interface RoadmapContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  upcomingItems: RoadmapItem[];
  changelogs: Changelog[] | undefined;
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
  searchQuery: string;
  filterCategory: string;
  filterStatus: string;
  roadmapName: string;
  roadmapId: string;
  categories: string[];
}

export function RoadmapContent({
  activeTab,
  setActiveTab,
  upcomingItems,
  changelogs,
  itemsByStatus,
  selectedItemId,
  setSelectedItemId,
  feedbackContent,
  setFeedbackContent,
  feedbackSentiment,
  setFeedbackSentiment,
  handleVote,
  handleSubmitFeedback,
  searchQuery,
  filterCategory,
  filterStatus,
  roadmapName,
  roadmapId,
  categories,
}: RoadmapContentProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "REVIEW":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "DONE":
        return "bg-green-500";
      case "BACKLOG":
        return "bg-gray-500";
      case "CANCELLED":

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
      case "BACKLOG":
        return <Circle className="h-4 w-4" />;
      case "BLOCKED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger
            value="kanban"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            Kanban View
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            Upcoming
            {upcomingItems.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                {upcomingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="changelog"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            Changelog
            {(changelogs?.length || 0) > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                {changelogs?.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Kanban View */}
        <TabsContent value="kanban" className="mt-6">
          <RoadmapKanbanView
            itemsByStatus={itemsByStatus}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            feedbackContent={feedbackContent}
            setFeedbackContent={setFeedbackContent}
            feedbackSentiment={feedbackSentiment}
            setFeedbackSentiment={setFeedbackSentiment}
            handleVote={handleVote}
            handleSubmitFeedback={handleSubmitFeedback}
          />
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-6">
            {upcomingItems.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  No upcoming features
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ||
                    filterCategory !== "all" ||
                    filterStatus !== "all"
                    ? "No items match your current filters"
                    : "Check back soon for upcoming features"}
                </p>
              </div>
            ) : (
              upcomingItems.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-border/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={`${getStatusColor(item.status)} text-white`}
                            variant="secondary"
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                          {item.targetDate && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              {format(new Date(item.targetDate), "MMM yyyy")}
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-semibold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{item.voteCount} votes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{item.feedbackCount} comments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Updated{" "}
                              {formatDistanceToNow(new Date(item.updatedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center gap-2 self-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(item.id)}
                          className="flex items-center gap-2 w-full"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Vote</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItemId(item.id)}
                          className="flex items-center gap-2 w-full"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Comment</span>
                        </Button>
                      </div>
                    </div>

                    {/* Feedback form */}
                    {selectedItemId === item.id && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium mb-2">Add your feedback</h4>
                        <Textarea
                          placeholder="Share your thoughts on this feature..."
                          value={feedbackContent}
                          onChange={(e) => setFeedbackContent(e.target.value)}
                          className="mb-3"
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
        </TabsContent>

        {/* Changelog Tab */}
        <TabsContent value="changelog" className="mt-6">
          <div className="space-y-8">
            {!changelogs || changelogs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  No changelog entries yet
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for updates on our progress
                </p>
              </div>
            ) : (
              changelogs.map((changelog) => (
                <Card
                  key={changelog.id}
                  className="overflow-hidden border-border/50 hover:shadow-md transition-all"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {changelog.title}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            new Date(changelog.publishDate),
                            "MMMM d, yyyy"
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="whitespace-pre-line">
                        {changelog.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {changelog.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 pb-3 border-b last:border-0"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(item.status)}`}
                          ></div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border-t py-12 mt-12 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {roadmapName}
                </h3>
                <p className="text-sm text-muted-foreground">Product Roadmap</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="max-w-md space-y-3">
              <p className="text-lg font-medium">Have an idea for a feature?</p>
              <p className="text-muted-foreground">
                We'd love to hear from you! Share your suggestions and help us
                build something amazing together.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <FeatureRequestDialog
                roadmapId={roadmapId}
                categories={categories}
                roadmapName={roadmapName}
                trigger={
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Request a Feature
                  </Button>
                }
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>Join thousands of users shaping the future</span>
              </div>
            </div>

            {/* Powered by */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border/50">
              <span>Powered by</span>
              <span className="font-medium text-foreground">Ray AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
