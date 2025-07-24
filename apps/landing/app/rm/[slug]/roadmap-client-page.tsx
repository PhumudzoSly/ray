"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as roadmapActions from "@/actions/roadmap";
import { toast } from "sonner";
import { RoadmapHeader } from "./components/roadmap-header";
import { RoadmapContent } from "./components/roadmap-content";

interface RoadmapClientPageProps {
  roadmap: {
    id: string;
    name: string;
    description: string;
    slug: string;
    allowVoting: boolean;
    allowFeedback: boolean;
    project: {
      id: string;
      name: string;
      description: string | null;
      status: string | null;
      platform: string;
      createdAt: Date;
    };
  };
}

export function RoadmapClientPage({ roadmap }: RoadmapClientPageProps) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [userIp, setUserIp] = useState<string>("");

  // Fetch roadmap items
  const { data: allItems = [] } = useQuery({
    queryKey: ["publicRoadmapItems", roadmap.id],
    queryFn: async () => {
      const res = await roadmapActions.getAllRoadmapItems(roadmap.id);
      return res?.success ? res.data : [];
    },
  });

  // Fetch changelogs
  const { data: changelogsData = [] } = useQuery({
    queryKey: ["changelogs", roadmap.id],
    queryFn: async () => {
      const res = await roadmapActions.getAllRoadmapChangelogs(roadmap.id);
      return res?.success ? res.data : [];
    },
  });

  // Transform changelogs to match expected interface
  const changelogs = changelogsData.map((changelog: any) => ({
    id: changelog.id,
    title: changelog.title,
    description: changelog.description,
    version: changelog.version,
    publishDate: new Date(changelog.publishDate).getTime(),
    entries: changelog.entries || [],
    // Legacy support
    items: [
      ...(changelog.newFeatures || []).map((feature: string) => ({
        title: feature,
        description: `New feature: ${feature}`,
        status: "NEW",
      })),
      ...(changelog.fixes || []).map((fix: string) => ({
        title: fix,
        description: `Bug fix: ${fix}`,
        status: "FIXED",
      })),
    ],
  }));

  // Mutations
  const voteForItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      ipAddress,
    }: {
      itemId: string;
      ipAddress: string;
    }) => {
      const res = await roadmapActions.createRoadmapVote({
        roadmapItemId: itemId,
        ipAddress,
      });
      if (!res?.success) {
        throw new Error(res?.error || "Failed to vote");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["publicRoadmapItems", roadmap.id],
      });
      toast.success("Vote recorded!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record vote");
    },
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async ({
      itemId,
      ipAddress,
      content,
      sentiment,
    }: {
      itemId: string;
      ipAddress: string;
      content: string;
      sentiment: "positive" | "neutral" | "negative";
    }) => {
      const res = await roadmapActions.createRoadmapFeedback({
        roadmapItemId: itemId,
        ipAddress,
        content,
        sentiment,
      });
      if (!res?.success) {
        throw new Error(res?.error || "Failed to submit feedback");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["publicRoadmapItems", roadmap.id],
      });
      toast.success("Feedback submitted!");
      setFeedbackContent("");
      setSelectedItemId(null);
      setIsFeedbackModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });

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

  // Transform items to match expected interface
  const transformItem = (item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    category: item.category,
    priority: item.priority,
    voteCount: item.voteCount,
    feedbackCount: item.feedbackCount,
    targetDate: item.targetDate
      ? new Date(item.targetDate).getTime()
      : undefined,
    updatedAt: new Date(item.updatedAt).getTime(),
  });

  // Filter and sort items
  const filteredItems = (allItems || []).filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "" || item.category === filterCategory;
    const matchesStatus = filterStatus === "" || item.status === filterStatus;
    const matchesPriority =
      filterPriority === "" || item.priority === filterPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Get unique categories and statuses for filters
  const categories = [...new Set(allItems?.map((item) => item.category) || [])];
  const statuses = [...new Set(allItems?.map((item) => item.status) || [])];

  // Group items by status for kanban view
  const itemsByStatus = {
    IN_REVIEW: filteredItems
      .filter((item) => item.status === "IN_REVIEW")
      .map(transformItem),
    IN_PROGRESS: filteredItems
      .filter((item) => item.status === "IN_PROGRESS")
      .map(transformItem),
    DONE: filteredItems
      .filter((item) => item.status === "DONE")
      .map(transformItem),
    CANCELLED: filteredItems
      .filter((item) => item.status === "CANCELLED")
      .map(transformItem),
    BLOCKED: filteredItems
      .filter((item) => item.status === "BLOCKED")
      .map(transformItem),
    BACKLOG: filteredItems
      .filter((item) => item.status === "BACKLOG")
      .map(transformItem),
  };

  // Handle voting
  const handleVote = async (itemId: string) => {
    if (!roadmap.allowVoting) {
      toast.error("Voting is not enabled for this roadmap");
      return;
    }

    if (!userIp) {
      toast.error("Unable to determine your IP address for voting");
      return;
    }

    voteForItemMutation.mutate({ itemId, ipAddress: userIp });
  };

  // Handle submitting feedback
  const handleSubmitFeedback = async () => {
    if (!roadmap.allowFeedback) {
      toast.error("Feedback is not enabled for this roadmap");
      return;
    }

    if (!selectedItemId || !feedbackContent.trim() || !userIp) {
      toast.error("Please provide feedback content");
      return;
    }

    addFeedbackMutation.mutate({
      itemId: selectedItemId,
      ipAddress: userIp,
      content: feedbackContent,
      sentiment: "neutral", // Default sentiment, will be analyzed in background
    });
  };

  return (
    <>
      <RoadmapHeader roadmap={roadmap} categories={categories} />

      <div className="container mx-auto px-4 py-3">
        <RoadmapContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          changelogs={changelogs}
          itemsByStatus={itemsByStatus}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          feedbackContent={feedbackContent}
          setFeedbackContent={setFeedbackContent}
          handleVote={handleVote}
          handleSubmitFeedback={handleSubmitFeedback}
          isFeedbackModalOpen={isFeedbackModalOpen}
          setIsFeedbackModalOpen={setIsFeedbackModalOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          roadmapName={roadmap.name}
          roadmapId={roadmap.id}
          categories={categories}
          statuses={statuses}
        />
      </div>
    </>
  );
}
