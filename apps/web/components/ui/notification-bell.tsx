"use client";

import React, { useState, useMemo } from "react";
import { Bell, Check, CheckCheck, X, Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useSession } from "@/context/session-context";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Id } from "@workspace/backend";

interface NotificationItemProps {
  notification: {
    _id: Id<"notifications">;
    type: string;
    title: string;
    message: string;
    priority: string;
    isRead: boolean;
    createdAt: number;
    actionUrl?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  };
  onMarkAsRead: (id: Id<"notifications">) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 bg-red-50 border-red-200";
      case "HIGH":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "MEDIUM":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "LOW":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ISSUE_ASSIGNED":
      case "ISSUE_UPDATED":
      case "ISSUE_COMPLETED":
        return "🎯";
      case "PROJECT_INVITED":
      case "PROJECT_UPDATED":
        return "📁";
      case "FEATURE_ADDED":
        return "✨";
      case "COMMENT_ADDED":
        return "💬";
      case "DEPENDENCY_BLOCKED":
        return "🚫";
      case "DUE_DATE_APPROACHING":
        return "⏰";
      case "ROADMAP_UPDATED":
        return "🗺️";
      case "LAUNCH_REMINDER":
        return "🚀";
      case "ORG_ANNOUNCEMENT":
        return "📢";
      case "SYSTEM_UPDATE":
        return "⚙️";
      default:
        return "📋";
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={`p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
        !notification.isRead ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg mt-0.5 flex-shrink-0">
          {getTypeIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium line-clamp-1">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(notification.priority)}`}
              >
                {notification.priority}
              </Badge>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
            {notification.actionUrl && (
              <span className="text-xs text-blue-600 hover:text-blue-800">
                View →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell: React.FC = () => {
  const { token } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch notifications (last 100, newest first)
  const notifications = useQuery(api.notifications.getUserNotifications, {
    token,
    limit: 100,
    includeRead: true,
  });

  // Get unread count
  const notificationCount = useQuery(api.notifications.getNotificationCount, {
    token,
  });

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ token, notificationId });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ token });
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Filter notifications based on search query
  const filteredNotifications = useMemo(() => {
    if (!notifications || !searchQuery.trim()) {
      return notifications || [];
    }

    const query = searchQuery.toLowerCase().trim();
    return notifications.filter((notification) => {
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.type.toLowerCase().includes(query) ||
        notification.priority.toLowerCase().includes(query)
      );
    });
  }, [notifications, searchQuery]);

  const unreadCount = notificationCount?.total || 0;
  const unreadNotifications =
    filteredNotifications.filter((n) => !n.isRead) || [];
  const readNotifications = filteredNotifications.filter((n) => n.isRead) || [];

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSearchQuery(""); // Clear search when dropdown closes
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <DropdownMenuLabel className="p-0 font-semibold">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications === undefined ? (
            // Loading state
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 && searchQuery ? (
            // No search results
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-sm mb-1">No results found</h3>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search terms or{" "}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  clear search
                </button>
              </p>
            </div>
          ) : notifications.length === 0 ? (
            // Empty state
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-sm mb-1">No notifications</h3>
              <p className="text-xs text-muted-foreground">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            // Notifications list
            <div>
              {/* Search results summary */}
              {searchQuery && (
                <div className="px-4 py-2 bg-blue-50/50 border-b">
                  <span className="text-xs font-medium text-blue-700">
                    {filteredNotifications.length} result
                    {filteredNotifications.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                  </span>
                </div>
              )}

              {/* Unread notifications */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-muted/50 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      UNREAD ({unreadNotifications.length})
                    </span>
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}

              {/* Read notifications */}
              {readNotifications.length > 0 && (
                <div>
                  {unreadNotifications.length > 0 && (
                    <div className="px-4 py-2 bg-muted/30 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        READ ({readNotifications.length})
                      </span>
                    </div>
                  )}
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {notifications && notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false);
                // Navigate to notifications page if it exists
                // window.location.href = "/notifications";
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
