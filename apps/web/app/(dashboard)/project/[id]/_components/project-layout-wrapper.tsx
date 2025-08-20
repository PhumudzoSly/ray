"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ProjectLayoutWrapperProps {
  children: ReactNode;
  projectId: string;
  fallback: ReactNode;
}

export function ProjectLayoutWrapper({
  children,
  projectId,
  fallback,
}: ProjectLayoutWrapperProps) {
  const pathname = usePathname();

  // Early return for special routes
  if (pathname === `/project/${projectId}/flow`) return children;
  if (pathname === `/project/${projectId}/board`) return children;

  return fallback;
}
