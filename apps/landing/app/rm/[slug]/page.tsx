"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { RoadmapHeader } from "./components/roadmap-header";
import { RoadmapFilters } from "./components/roadmap-filters";
import { RoadmapContent } from "./components/roadmap-content";
import { Id } from "@/convex/_generated/dataModel";

export default function PublicRoadmapPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackSentiment, setFeedbackSentiment] = useState<
    "positive" | "neutral" | "negative"
  >("neutral");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [userIp, setUserIp] = useState<string>("");

  // Fetch roadmap data
  const roadmap = useQuery(api.roadmap.getRoadmapBySlug, { slug });

  // Fetch roadmap items based on active tab
  const allItems = useQuery(
    api.roadmap.items.getPublicRoadmapItems,
    roadmap
      ? {
          roadmapId: roadmap._id,
        }
      : "skip"
  );

  // Fetch changelogs
  const changelogs = useQuery(
    api.roadmap.changelog.getChangelogs,
    roadmap
      ? {
          roadmapId: roadmap._id,
          onlyPublished: true,
        }
      : "skip"
  );

  // Mutations
  const voteForItem = useMutation(api.roadmap.items.voteForItem);
  const addFeedback = useMutation(api.roadmap.feedback.addFeedback);

  // Get user IP address for voting
  useEffect(() => {
    const getIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserIp(data.ip);
      } catch (error) {
        console.error("Failed to get IP address:", error);
        setUserIp("unknown");
      }
    };

    getIp();
  }, []);

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter and sort items
  const filteredItems = (allItems || []).filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group items by status for the upcoming tab
  const upcomingItems = filteredItems
    .filter((item) => item.status !== "DONE" && item.status !== "CANCELLED")
    .sort((a, b) => b.voteCount - a.voteCount);

  // Get unique categories and statuses for filters
  const categories = [...new Set(allItems?.map((item) => item.category) || [])];
  const statuses = [...new Set(allItems?.map((item) => item.status) || [])];

  // Group items by status for kanban view
  const itemsByStatus = {
    REVIEW: filteredItems.filter((item) => item.status === "REVIEW"),
    IN_PROGRESS: filteredItems.filter((item) => item.status === "IN_PROGRESS"),
    DONE: filteredItems.filter((item) => item.status === "DONE"),
    CANCELLED: filteredItems.filter((item) => item.status === "CANCELLED"),
    BLOCKED: filteredItems.filter((item) => item.status === "BLOCKED"),
    BACKLOG: filteredItems.filter((item) => item.status === "BACKLOG"),
  };

  // Handle voting
  const handleVote = async (itemId: string) => {
    if (!userIp) {
      toast.error("Unable to determine your IP address for voting");
      return;
    }

    try {
      await voteForItem({
        itemId: itemId as Id<"roadmapItems">,
        ipAddress: userIp,
      });
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("You have already voted for this item");
    }
  };

  // Handle submitting feedback
  const handleSubmitFeedback = async () => {
    if (!selectedItemId || !feedbackContent.trim() || !userIp) {
      toast.error("Please provide feedback content");
      return;
    }

    try {
      await addFeedback({
        itemId: selectedItemId as Id<"roadmapItems">,
        ipAddress: userIp,
        content: feedbackContent,
        sentiment: feedbackSentiment,
      });
      toast.success(
        "Feedback submitted! It will be reviewed before being published."
      );
      setFeedbackContent("");
      setSelectedItemId(null);
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <RoadmapHeader roadmap={roadmap} categories={categories} />

      <div className="container mx-auto px-4 py-8">
        <RoadmapFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          categories={categories}
          statuses={statuses}
        />

        <RoadmapContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          upcomingItems={upcomingItems}
          changelogs={changelogs}
          itemsByStatus={itemsByStatus}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          feedbackContent={feedbackContent}
          setFeedbackContent={setFeedbackContent}
          feedbackSentiment={feedbackSentiment}
          setFeedbackSentiment={setFeedbackSentiment}
          handleVote={handleVote}
          handleSubmitFeedback={handleSubmitFeedback}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          filterStatus={filterStatus}
          roadmapName={roadmap.name}
          roadmapId={roadmap._id}
          categories={categories}
        />
      </div>
    </div>
  );
}
