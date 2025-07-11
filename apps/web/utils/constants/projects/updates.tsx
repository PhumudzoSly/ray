import {
  CheckIcon,
  AlertTriangle,
  AlertCircle,
  CircleSlash,
  CheckCircle2,
} from "lucide-react";

export const PROJECT_UPDATE_STATUS = {
  ON_TRACK: "ON_TRACK",
  AT_RISK: "AT_RISK",
  OFF_TRACK: "OFF_TRACK",
  BLOCKED: "BLOCKED",
  COMPLETED: "COMPLETED",
} as const;

export type ProjectUpdateStatus = keyof typeof PROJECT_UPDATE_STATUS;

export const PROJECT_UPDATE_REACTIONS = {
  THUMBS_UP: "THUMBS_UP",
  THUMBS_DOWN: "THUMBS_DOWN",
  HEART: "HEART",
  ROCKET: "ROCKET",
  EYES: "EYES",
  CELEBRATE: "CELEBRATE",
} as const;

export type ProjectUpdateReaction = keyof typeof PROJECT_UPDATE_REACTIONS;

export const updateStatuses = {
  [PROJECT_UPDATE_STATUS.ON_TRACK]: {
    icon: CheckIcon,
    color: "text-green-500",
    bgColor: "bg-green-500/15",
    name: "On Track",
  },
  [PROJECT_UPDATE_STATUS.AT_RISK]: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/15",
    name: "At Risk",
  },
  [PROJECT_UPDATE_STATUS.OFF_TRACK]: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/15",
    name: "Off Track",
  },
  [PROJECT_UPDATE_STATUS.BLOCKED]: {
    icon: CircleSlash,
    color: "text-orange-500",
    bgColor: "bg-orange-500/15",
    name: "Blocked",
  },
  [PROJECT_UPDATE_STATUS.COMPLETED]: {
    icon: CheckCircle2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/15",
    name: "Completed",
  },
};

export const reactionEmojis: Record<ProjectUpdateReaction, string> = {
  THUMBS_UP: "👍",
  THUMBS_DOWN: "👎",
  HEART: "❤️",
  ROCKET: "🚀",
  EYES: "👀",
  CELEBRATE: "🎉",
};

export function getReactionEmoji(type: ProjectUpdateReaction) {
  return reactionEmojis[type];
}

export function getUpdateStatus(status: ProjectUpdateStatus) {
  return updateStatuses[status];
}
