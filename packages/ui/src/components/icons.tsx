"use client";

import * as LucideIcons from "lucide-react";

type IconKeys = keyof typeof LucideIcons;

export const Icons: Record<IconKeys, (typeof LucideIcons)[IconKeys]> = {
  ...LucideIcons,
};
