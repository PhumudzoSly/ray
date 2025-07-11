"use client";
import { FeatureTable } from "@/components/project/features/feature-table";
import { Id } from "@workspace/backend";
import { useParams } from "next/navigation";
import React from "react";

const Features = () => {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container">
      <FeatureTable projectId={id as Id<"projects">} />
    </div>
  );
};

export default Features;
