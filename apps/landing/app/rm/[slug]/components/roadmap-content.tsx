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
import { RoadmapFilters } from "./roadmap-filters";
import { LightbulbIcon } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";

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

interface ChangelogEntry {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  breaking?: boolean;
  issue?: any;
  feature?: any;
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
  version?: string;
  publishDate: number;
  entries: ChangelogEntry[];
  items: ChangelogItem[];
}

interface RoadmapContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  changelogs: Changelog[] | undefined;
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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  roadmapName: string;
  roadmapId: string;
  categories: string[];
  statuses: string[];
}

export function RoadmapContent({
  activeTab,
  setActiveTab,
  changelogs,
  itemsByStatus,
  selectedItemId,
  setSelectedItemId,
  feedbackContent,
  setFeedbackContent,
  handleVote,
  handleSubmitFeedback,
  isFeedbackModalOpen,
  setIsFeedbackModalOpen,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  roadmapName,
  roadmapId,
  categories,
  statuses,
}: RoadmapContentProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "REVIEW":
        return "bg-blue-600";
      case "IN_PROGRESS":
        return "bg-amber-600";
      case "DONE":
        return "bg-green-600";
      case "BACKLOG":
        return "bg-slate-600";
      case "CANCELLED":
      case "BLOCKED":
        return "bg-red-600";
      default:
        return "bg-slate-600";
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
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-4 flex-wrap justify-between">
          <TabsList className="h-10 bg-muted/50 backdrop-blur-sm border border-border/50 order-2 md:order-1">
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
            >
              Roadmap
            </TabsTrigger>

            <TabsTrigger
              value="changelog"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
            >
              Changelog
              {(changelogs?.length || 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground"
                >
                  {changelogs?.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto order-1 md:order-2">
            <RoadmapFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              categories={categories}
              statuses={statuses}
            />

            <FeatureRequestDialog
              roadmapId={roadmapId}
              categories={categories}
              roadmapName={roadmapName}
              trigger={
                <Button className="w-full sm:w-auto">
                  <LightbulbIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Request a Feature</span>
                </Button>
              }
            />
          </div>
        </div>

        {/* Kanban View */}
        <TabsContent value="kanban">
          <RoadmapKanbanView
            itemsByStatus={itemsByStatus}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            feedbackContent={feedbackContent}
            setFeedbackContent={setFeedbackContent}
            handleVote={handleVote}
            handleSubmitFeedback={handleSubmitFeedback}
            isFeedbackModalOpen={isFeedbackModalOpen}
            setIsFeedbackModalOpen={setIsFeedbackModalOpen}
          />
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
              changelogs.map((changelog) => {
                const hasEntries = changelog.entries && changelog.entries.length > 0;
                
                return (
                  <Card
                    key={changelog.id}
                    className="overflow-hidden border-border/50 hover:shadow-md transition-all"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-xl">
                              {changelog.title}
                            </CardTitle>
                            {changelog.version && (
                              <Badge variant="outline" className="text-xs">
                                {changelog.version}
                              </Badge>
                            )}
                          </div>
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

                      {/* Enhanced Entries Display */}
                      {hasEntries ? (
                        <div className="space-y-4">
                          {changelog.entries.map((entry, index) => (
                            <div
                              key={entry.id || index}
                              className="flex items-start gap-3 pb-3 border-b last:border-0"
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  entry.type === "FEATURE" ? "bg-green-500" :
                                  entry.type === "FIX" ? "bg-blue-500" :
                                  entry.type === "IMPROVEMENT" ? "bg-purple-500" :
                                  entry.type === "BREAKING" ? "bg-red-500" :
                                  entry.type === "SECURITY" ? "bg-orange-500" :
                                  entry.type === "DEPRECATION" ? "bg-yellow-500" :
                                  entry.type === "DOCUMENTATION" ? "bg-gray-500" :
                                  entry.type === "PERFORMANCE" ? "bg-indigo-500" :
                                  "bg-gray-500"
                                }`}
                              ></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-medium">{entry.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {entry.type}
                                  </Badge>
                                  {entry.breaking && (
                                    <Badge variant="destructive" className="text-xs">
                                      Breaking
                                    </Badge>
                                  )}
                                  {entry.priority && (
                                    <Badge variant="secondary" className="text-xs">
                                      {entry.priority}
                                    </Badge>
                                  )}
                                  {entry.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {entry.category}
                                    </Badge>
                                  )}
                                </div>
                                {entry.description && (
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {entry.description}
                                  </p>
                                )}
                                {(entry.issue || entry.feature) && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Link className="w-3 h-3" />
                                    {entry.issue && `Issue: ${entry.issue.title}`}
                                    {entry.issue && entry.feature && " • "}
                                    {entry.feature && `Feature: ${entry.feature.name}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Legacy Support - Show old format if no entries */
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
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
