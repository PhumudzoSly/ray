"use client";

import { cn } from "@/lib/utils";
import React from "react";

const DangerousHTML = ({
  html,
  className,
}: {
  html: string;
  className?: string;
}) => {
  return (
    <span
      className={cn(className)}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
};

export default DangerousHTML;
