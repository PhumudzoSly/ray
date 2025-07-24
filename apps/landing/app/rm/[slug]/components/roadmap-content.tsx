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
import { RoadmapChangelogView } from "./roadmap-changelog-view";
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
  priority: string;
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
          <RoadmapChangelogView changelogs={changelogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
