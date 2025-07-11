import React from "react";
import { Clock, User, Plus, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import LoadingSpinner from "@workspace/ui/components/LoadingSpinner";
import { useData } from "@/hooks/use-data";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { Badge } from "@workspace/ui/components/badge";

interface ActivityItem {
  _id: string;
  activity: string;
  title: string;
  description?: string;
  user?: {
    _id: string;
    _creationTime: number;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    role?: string;
    updatedAt?: string;
    twoFactorEnabled?: boolean;
  } | null;
  metadata?: {
    oldValue?: string;
    newValue?: string;
  };
  createdAt: string;
}

type EntityType =
  | "project"
  | "feature"
  | "issue"
  | "idea"
  | "roadmap"
  | "milestone";

interface ActivityFeedProps {
  entityType: EntityType;
  entityId: string;
  emptyMessage?: string;
  limit?: number;
}

const getActivityIcon = (activity: string) => {
  switch (activity) {
    case "created":
      return <Plus className="h-3 w-3" />;
    case "updated":
      return <div className="h-2 w-2 rounded-full bg-blue-500" />;
    case "phase_changed":
      return <div className="h-2 w-2 rounded-full bg-purple-500" />;
    case "assigned":
      return <User className="h-3 w-3" />;
    case "unassigned":
      return <User className="h-3 w-3 opacity-50" />;
    case "dependency_added":
      return <GitBranch className="h-3 w-3" />;
    case "dependency_removed":
      return <GitBranch className="h-3 w-3 opacity-50" />;
    case "link_added":
      return <div className="h-2 w-2 rounded-full bg-green-500" />;
    case "link_removed":
      return <div className="h-2 w-2 rounded-full bg-red-500" />;
    case "parent_changed":
      return <GitBranch className="h-3 w-3" />;
    default:
      return <div className="h-2 w-2 rounded-full bg-muted-foreground" />;
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  entityType,
  entityId,
  emptyMessage = "No activity yet",
  limit = 20,
}) => {
  const { token } = useSession();

  const { data: activities, isPending } = useData(
    api.activities.getActivitiesByEntity,
    {
      token,
      entityType,
      entityId,
      limit,
    }
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-4 w-4 mb-1.5 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={activity._id}
          className="relative flex items-start gap-2.5 py-2 group hover:bg-muted/20 -mx-2 px-2 transition-colors"
        >
          {/* Timeline line */}
          {index !== activities.length - 1 && (
            <div className="absolute left-[17.7px] top-[30px] w-px h-full bg-border/60" />
          )}

          {/* Activity icon */}
          <div className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border/60">
            {getActivityIcon(activity.activity)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-tight">
                  <span className="font-medium">
                    {activity.user?.name || "Someone"}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {activity.title}
                  </span>
                </p>

                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 leading-tight">
                    {activity.description}
                  </p>
                )}

                {activity.metadata && (
                  <div className="mt-2 text-xs">
                    {activity.metadata.oldValue &&
                      activity.metadata.newValue && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Badge
                            variant="error"
                            className="capitalize bg-muted/60 rounded text-xs"
                          >
                            {activity.metadata.oldValue.toLocaleLowerCase()}
                          </Badge>
                          <span className="text-muted-foreground/40 mb-1">
                            →
                          </span>
                          <Badge
                            variant="neutral"
                            className="capitalize bg-muted/60 rounded text-xs font-medium"
                          >
                            {activity.metadata.newValue.toLocaleLowerCase()}
                          </Badge>
                        </div>
                      )}
                    {activity.metadata.newValue &&
                      !activity.metadata.oldValue && (
                        <span className="capitalize bg-muted/60 rounded text-xs font-medium">
                          {activity.metadata.newValue.toLocaleLowerCase()}
                        </span>
                      )}
                    {activity.metadata.oldValue &&
                      !activity.metadata.newValue && (
                        <span className="capitalize bg-muted/60 rounded text-xs line-through text-muted-foreground">
                          {activity.metadata.oldValue.toLocaleLowerCase()}
                        </span>
                      )}
                  </div>
                )}
              </div>

              <time className="text-xs text-muted-foreground/70 flex-shrink-0 ml-3">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
