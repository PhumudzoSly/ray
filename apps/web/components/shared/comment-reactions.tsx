import React, { useState } from "react";
import { Smile, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useSession } from "@/context/session-context";

interface CommentReactionsProps {
  reactions: Record<string, any[]>;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  showAddButton?: boolean;
  compact?: boolean;
  availableReactions?: string[];
}

// Pre-defined emoji reactions (same as backend)
const ALLOWED_REACTIONS = [
  "👍",
  "👎",
  "❤️",
  "😄",
  "😮",
  "😢",
  "😡",
  "🎉",
  "🚀",
  "👀",
  "🔥",
  "💯",
  "✅",
  "❌",
  "⚠️",
  "💡",
];

export const CommentReactions: React.FC<CommentReactionsProps> = ({
  reactions,
  onAddReaction,
  onRemoveReaction,
  showAddButton = false,
  compact = false,
  availableReactions = ALLOWED_REACTIONS,
}) => {
  const { token } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).userId
    : null;

  const handleReactionClick = (emoji: string) => {
    const userReactions = reactions[emoji] || [];
    const hasUserReaction = userReactions.some(
      (r) => r.userId === currentUserId
    );

    if (hasUserReaction) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }

    if (showAddButton) {
      setIsOpen(false);
    }
  };

  const reactionEntries = Object.entries(reactions).filter(
    ([_, reactions]) => reactions.length > 0
  );

  if (reactionEntries.length === 0 && !showAddButton) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Existing reactions */}
      {reactionEntries.map(([emoji, reactionList]) => {
        const hasUserReaction = reactionList.some(
          (r) => r.userId === currentUserId
        );

        return (
          <Button
            key={emoji}
            variant={hasUserReaction ? "default" : "secondary"}
            size={compact ? "sm" : "sm"}
            onClick={() => handleReactionClick(emoji)}
            className={`h-6 px-2 text-xs transition-colors ${
              hasUserReaction
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <span className="mr-1">{emoji}</span>
            <span>{reactionList.length}</span>
          </Button>
        );
      })}

      {/* Add reaction button */}
      {showAddButton && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size={compact ? "sm" : "sm"}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-8 gap-1">
              {availableReactions.map((emoji) => {
                const reactionList = reactions[emoji] || [];
                const hasUserReaction = reactionList.some(
                  (r) => r.userId === currentUserId
                );

                return (
                  <Button
                    key={emoji}
                    variant={hasUserReaction ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleReactionClick(emoji)}
                    className={`h-8 w-8 p-0 text-lg ${
                      hasUserReaction
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted"
                    }`}
                  >
                    {emoji}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
