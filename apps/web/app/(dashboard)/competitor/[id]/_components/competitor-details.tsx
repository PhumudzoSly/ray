"use client";

import React, { useState } from "react";
import { getCompetitor, editCompetitor } from "@/actions/idea/competitor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { InlineEditField } from "@workspace/ui/components/inline-field";
import { InlineEditTextArea } from "@workspace/ui/components/inline-textarea";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import NoData from "@/components/shared/no-data";
import { toast } from "sonner";
import Link from "next/link";
import { BiInfoCircle } from "react-icons/bi";
import { TrendingUp, Target, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { CompetitorDetailsView } from "./competitor-details-view";
import { CompetitorSwotView } from "./competitor-swot-view";
import { CompetitorMovesView } from "./competitor-moves-view";

interface CompanyDetailProps {
  label: string;
  value: string | null;
  href?: string;
}

function CompanyDetail({ label, value, href }: CompanyDetailProps) {
  const displayValue = value || "Not specified";

  return (
    <div className="space-y-2 py-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {href && value ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5"
        >
          {value.replace(/^https?:\/\//, "")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <p
          className={`text-sm font-medium ${!value ? "text-muted-foreground" : ""}`}
        >
          {displayValue}
        </p>
      )}
    </div>
  );
}

export const CompetitorDetails = ({ id }: { id: string }) => {
  const [view, setView] = useState<"details" | "swot" | "moves">("details");
  const queryClient = useQueryClient();

  const { data: competitor, isLoading: isPending } = useQuery({
    queryKey: ["competitor", id],
    queryFn: () => getCompetitor({ id }),
  });

  // Generic optimistic update mutation for any field
  const updateCompetitorFieldMutation = useMutation({
    mutationFn: async (
      update: { competitorId: string } & Record<string, any>
    ) => {
      const { competitorId, ...fields } = update;
      return await editCompetitor({ id: competitorId, data: fields as any });
    },
    onMutate: async (update) => {
      const { competitorId, ...fields } = update;
      await queryClient.cancelQueries({ queryKey: ["competitor", id] });
      const previousCompetitor = queryClient.getQueryData(["competitor", id]);
      queryClient.setQueryData(["competitor", id], (old: any) => ({
        ...old,
        ...fields,
      }));
      return { previousCompetitor };
    },
    onError: (err, variables, context) => {
      if (context?.previousCompetitor) {
        queryClient.setQueryData(
          ["competitor", id],
          context.previousCompetitor
        );
      }
      toast.error("Failed to update competitor");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor", id] });
    },
  });

  if (isPending || competitor === undefined)
    return (
      <div className="flex items-center justify-center p-20">
        <LoadingSpinner />
      </div>
    );
  if (competitor === null) return <NoData />;

  return (
    <div className="container space-y-4">
      <div className="flex items-center gap-2 p-4">
        <Badge variant="dark" className="text-xs font-medium px-2 py-0.5">
          Competitor
        </Badge>
        <Link
          href={`/ideas/${competitor.ideaId}`}
          className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1"
        >
          <span>{competitor?.idea.name}</span>
        </Link>
      </div>

      <div className="px-4 flex items-center">
        {competitor.logoUrl && (
          <img
            src={competitor.logoUrl}
            alt={`${competitor.name} logo`}
            className="w-12 h-12 rounded-lg object-contain bg-muted/30 p-2"
          />
        )}
        <InlineEditField
          value={competitor.name}
          onSave={async (value) => {
            await updateCompetitorFieldMutation.mutateAsync({
              competitorId: id,
              name: value,
            });
          }}
          displayValue={
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {competitor.name}
            </h1>
          }
          className="text-2xl md:text-3xl font-bold"
        />
      </div>

      <div className="mt-2 p-4">
        <InlineEditTextArea
          value={competitor.description || ""}
          onSave={async (value) => {
            await updateCompetitorFieldMutation.mutateAsync({
              competitorId: id,
              description: value,
            });
          }}
          placeholder="No description provided."
        />
      </div>

      {/* Company Details */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <CompanyDetail
          label="Website"
          value={competitor.website}
          href={competitor.website || "#"}
        />
        <CompanyDetail
          label="Founded"
          value={competitor.foundedYear?.toString() || ""}
        />
        <CompanyDetail label="Location" value={competitor.headquarters} />
        <CompanyDetail label="Team Size" value={competitor.employeeCount} />
        <CompanyDetail
          label="Target audience"
          value={competitor.targetAudience || "Not defined"}
        />
      </div>

      <div className="w-full border-y">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-wrap w-full gap-4 p-4">
            <button
              onClick={() => setView("details")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "details"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <BiInfoCircle size={18} />
              Details
            </button>
            <button
              onClick={() => setView("swot")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "swot"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <Target size={18} />
              SWOT Analysis
            </button>
            <button
              onClick={() => setView("moves")}
              className={cn(
                "inline-flex gap-3 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                view === "moves"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-muted-foreground"
              )}
            >
              <TrendingUp size={18} />
              Competitive Moves
            </button>
          </div>
        </ScrollArea>
      </div>

      <div className="p-4">
        {view === "details" && <CompetitorDetailsView competitorId={id} />}
        {view === "swot" && <CompetitorSwotView competitorId={id} />}
        {view === "moves" && <CompetitorMovesView competitorId={id} />}
      </div>
    </div>
  );
};
