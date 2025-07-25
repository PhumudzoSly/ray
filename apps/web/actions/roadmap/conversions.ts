"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { createIssue } from "../issue";
import { createRoadmapItem } from "./items";
import { createFeature } from "../project/features";

/**
 * AI-powered conversion of feature request to issue
 */
export const convertFeatureRequestToIssue = async (data: {
  featureRequestId: string;
  projectId: string;
}) => {
  const { org, userId } = await getSession();

  try {
    // Get the feature request
    const featureRequest = await prisma.featureRequest.findFirst({
      where: {
        id: data.featureRequestId,
        roadmap: { project: { organizationId: org } },
      },
    });

    if (!featureRequest) {
      return {
        success: false,
        error: "Feature request not found or not in your organization",
      };
    }

    // Check if already converted
    if (
      featureRequest.convertedToIssueId ||
      featureRequest.convertedToFeatureId ||
      featureRequest.convertedToRoadmapItemId
    ) {
      return {
        success: false,
        error: "Feature request has already been converted",
      };
    }

    // AI-enhanced conversion logic
    const aiSuggestedData = await analyzeFeatureRequestForIssue(featureRequest);

    // Create the issue with AI suggestions
    const issueResult = await createIssue({
      title: aiSuggestedData.title,
      description: aiSuggestedData.description,
      projectId: data.projectId,
      priority: aiSuggestedData.priority,
      label: aiSuggestedData.label,
      status: "BACKLOG",
      sourceType: "feature_request",
      sourceFeedbackId: featureRequest.id,
      organizationId: org,
    });

    if (!issueResult.success || !issueResult.data) {
      return issueResult;
    }

    // Update feature request to track conversion
    await prisma.featureRequest.update({
      where: { id: data.featureRequestId },
      data: {
        status: "implemented",
        convertedToIssueId: issueResult.data.id,
        convertedAt: new Date(),
        convertedBy: userId,
        conversionNotes: `Converted to issue: ${issueResult.data.title}`,
        adminNotes: featureRequest.adminNotes
          ? `${featureRequest.adminNotes}\n\nConverted to issue: ${issueResult.data.title}`
          : `Converted to issue: ${issueResult.data.title}`,
      },
    });

    return {
      success: true,
      data: {
        issue: issueResult.data,
        aiSuggestions: aiSuggestedData,
      },
    };
  } catch (error) {
    console.error("Error converting feature request to issue:", error);
    return { success: false, error: "Failed to convert feature request" };
  }
};

/**
 * AI-powered conversion of feature request to roadmap item
 */
export const convertFeatureRequestToRoadmapItem = async (data: {
  featureRequestId: string;
  roadmapId: string;
}) => {
  const { org, userId } = await getSession();

  try {
    // Get the feature request
    const featureRequest = await prisma.featureRequest.findFirst({
      where: {
        id: data.featureRequestId,
        roadmap: { project: { organizationId: org } },
      },
    });

    if (!featureRequest) {
      return {
        success: false,
        error: "Feature request not found or not in your organization",
      };
    }

    // Check if already converted
    if (
      featureRequest.convertedToIssueId ||
      featureRequest.convertedToFeatureId ||
      featureRequest.convertedToRoadmapItemId
    ) {
      return {
        success: false,
        error: "Feature request has already been converted",
      };
    }

    // AI-enhanced conversion logic
    const aiSuggestedData =
      await analyzeFeatureRequestForRoadmapItem(featureRequest);

    // Create the roadmap item with AI suggestions
    const roadmapItemResult = await createRoadmapItem({
      roadmapId: data.roadmapId,
      title: aiSuggestedData.title,
      description: aiSuggestedData.description,
      status: aiSuggestedData.status,
      category: aiSuggestedData.category,
      priority: aiSuggestedData.priority,
      isPublic: true,
      targetDate: aiSuggestedData.targetDate,
    });

    if (!roadmapItemResult.success || !roadmapItemResult.data) {
      return roadmapItemResult;
    }

    // Update feature request to track conversion
    await prisma.featureRequest.update({
      where: { id: data.featureRequestId },
      data: {
        status: "implemented",
        convertedToRoadmapItemId: roadmapItemResult.data.id,
        convertedAt: new Date(),
        convertedBy: userId,
        conversionNotes: `Converted to roadmap item: ${roadmapItemResult.data.title}`,
        adminNotes: featureRequest.adminNotes
          ? `${featureRequest.adminNotes}\n\nConverted to roadmap item: ${roadmapItemResult.data.title}`
          : `Converted to roadmap item: ${roadmapItemResult.data.title}`,
      },
    });

    return {
      success: true,
      data: {
        roadmapItem: roadmapItemResult.data,
        aiSuggestions: aiSuggestedData,
      },
    };
  } catch (error) {
    console.error("Error converting feature request to roadmap item:", error);
    return { success: false, error: "Failed to convert feature request" };
  }
};

/**
 * AI-powered conversion of feature request to feature
 */
export const convertFeatureRequestToFeature = async (data: {
  featureRequestId: string;
  projectId: string;
}) => {
  const { org, userId } = await getSession();

  try {
    // Get the feature request
    const featureRequest = await prisma.featureRequest.findFirst({
      where: {
        id: data.featureRequestId,
        roadmap: { project: { organizationId: org } },
      },
    });

    if (!featureRequest) {
      return {
        success: false,
        error: "Feature request not found or not in your organization",
      };
    }

    // Check if already converted
    if (
      featureRequest.convertedToIssueId ||
      featureRequest.convertedToFeatureId ||
      featureRequest.convertedToRoadmapItemId
    ) {
      return {
        success: false,
        error: "Feature request has already been converted",
      };
    }

    // AI-enhanced conversion logic
    const aiSuggestedData =
      await analyzeFeatureRequestForFeature(featureRequest);

    // Create the feature with AI suggestions
    const featureResult = await createFeature({
      name: aiSuggestedData.name,
      description: aiSuggestedData.description,
      projectId: data.projectId,
      priority: aiSuggestedData.priority,
      phase: aiSuggestedData.phase as any,
      businessValue: aiSuggestedData.businessValue,
      estimatedEffort: aiSuggestedData.estimatedEffort,
      organizationId: org,
    });

    if (!featureResult.success) {
      return featureResult;
    }

    // Update feature request to track conversion
    await prisma.featureRequest.update({
      where: { id: data.featureRequestId },
      data: {
        status: "implemented",
        convertedToFeatureId: featureResult.data.id,
        convertedAt: new Date(),
        convertedBy: userId,
        conversionNotes: `Converted to feature: ${featureResult.data.name}`,
        adminNotes: featureRequest.adminNotes
          ? `${featureRequest.adminNotes}\n\nConverted to feature: ${featureResult.data.name}`
          : `Converted to feature: ${featureResult.data.name}`,
      },
    });

    return {
      success: true,
      data: {
        feature: featureResult.data,
        aiSuggestions: aiSuggestedData,
      },
    };
  } catch (error) {
    console.error("Error converting feature request to feature:", error);
    return { success: false, error: "Failed to convert feature request" };
  }
};

/**
 * AI analysis for issue conversion
 */
async function analyzeFeatureRequestForIssue(featureRequest: any) {
  // In a real implementation, this would use AI to analyze the content
  // For now, we'll use rule-based logic with some intelligence

  const title = optimizeTitle(featureRequest.title, "issue");
  const description = enhanceDescription(
    featureRequest.description,
    featureRequest.title,
    "issue"
  );

  // Determine priority based on request priority and keywords
  const priority = mapPriorityForIssue(
    featureRequest.priority,
    featureRequest.description
  );

  // Determine label based on category and content analysis
  const label = determineLabelFromContent(
    featureRequest.category,
    featureRequest.description
  );

  return {
    title,
    description,
    priority,
    label,
  };
}

/**
 * AI analysis for roadmap item conversion
 */
async function analyzeFeatureRequestForRoadmapItem(featureRequest: any) {
  const title = optimizeTitle(featureRequest.title, "roadmap");
  const description = enhanceDescription(
    featureRequest.description,
    featureRequest.title,
    "roadmap"
  );

  // Map category to roadmap category
  const category = mapCategoryForRoadmap(featureRequest.category);

  // Determine status based on priority and content
  const status = determineInitialStatus(featureRequest.priority);

  // Map priority
  const priority = mapPriorityForRoadmap(featureRequest.priority);

  // Estimate target date based on priority
  const targetDate = estimateTargetDate(featureRequest.priority);

  return {
    title,
    description,
    status,
    category,
    priority,
    targetDate,
  };
}

/**
 * AI analysis for feature conversion
 */
async function analyzeFeatureRequestForFeature(featureRequest: any) {
  const name = optimizeTitle(featureRequest.title, "feature");
  const description = enhanceDescription(
    featureRequest.description,
    featureRequest.title,
    "feature"
  );

  // Map priority
  const priority = mapPriorityForFeature(featureRequest.priority);

  // Determine initial phase
  const phase = "DISCOVERY";

  // Estimate business value and effort based on content analysis
  const businessValue = estimateBusinessValue(
    featureRequest.description,
    featureRequest.priority
  );
  const estimatedEffort = estimateEffort(featureRequest.description);

  return {
    name,
    description,
    priority,
    phase,
    businessValue,
    estimatedEffort,
  };
}

// Helper functions for AI-like analysis

function optimizeTitle(originalTitle: string, targetType: string): string {
  // Remove common prefixes and optimize for target type
  let title = originalTitle.trim();

  // Remove common request prefixes
  title = title.replace(
    /^(please add|add|implement|create|build|feature request:?|request:?)\s*/i,
    ""
  );

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Add context based on target type
  if (
    targetType === "issue" &&
    !title.toLowerCase().includes("implement") &&
    !title.toLowerCase().includes("add")
  ) {
    title = `Implement ${title}`;
  }

  return title;
}

function enhanceDescription(
  originalDescription: string,
  title: string,
  targetType: string
): string {
  let description = originalDescription.trim();

  // Add context based on target type
  if (targetType === "issue") {
    description = `**Feature Request Conversion**\n\n${description}\n\n**Acceptance Criteria:**\n- [ ] Implement the requested functionality\n- [ ] Test the implementation\n- [ ] Update documentation if needed`;
  } else if (targetType === "roadmap") {
    description = `${description}\n\n*This item was converted from a community feature request.*`;
  } else if (targetType === "feature") {
    description = `**User Request:** ${title}\n\n**Description:**\n${description}\n\n**Next Steps:**\n- Research and validate requirements\n- Create technical specification\n- Plan implementation approach`;
  }

  return description;
}

function mapPriorityForIssue(
  requestPriority: string,
  description: string
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  // Check for urgent keywords in description
  const urgentKeywords = [
    "urgent",
    "critical",
    "asap",
    "immediately",
    "blocking",
    "broken",
  ];
  const hasUrgentKeywords = urgentKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword)
  );

  if (hasUrgentKeywords) return "HIGH";

  const priorityMap: { [key: string]: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" } =
    {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      urgent: "CRITICAL",
    };

  return priorityMap[requestPriority] || "MEDIUM";
}

function mapPriorityForRoadmap(
  requestPriority: string
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const priorityMap: { [key: string]: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" } =
    {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      urgent: "CRITICAL",
    };

  return priorityMap[requestPriority] || "MEDIUM";
}

function mapPriorityForFeature(
  requestPriority: string
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const priorityMap: { [key: string]: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" } =
    {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      urgent: "CRITICAL",
    };

  return priorityMap[requestPriority] || "MEDIUM";
}

function determineLabelFromContent(
  category: string,
  description: string
):
  | "UI"
  | "BUG"
  | "FEATURE"
  | "IMPROVEMENT"
  | "TASK"
  | "DOCUMENTATION"
  | "REFACTOR"
  | "PERFORMANCE"
  | "DESIGN"
  | "SECURITY"
  | "ACCESSIBILITY"
  | "TESTING"
  | "INTERNATIONALIZATION" {
  // Analyze category and description to determine appropriate label
  const categoryLower = category.toLowerCase();
  const descriptionLower = description.toLowerCase();

  if (
    categoryLower.includes("ui") ||
    categoryLower.includes("interface") ||
    descriptionLower.includes("button") ||
    descriptionLower.includes("design")
  ) {
    return "UI";
  }

  if (
    categoryLower.includes("bug") ||
    descriptionLower.includes("error") ||
    descriptionLower.includes("broken")
  ) {
    return "BUG";
  }

  if (
    categoryLower.includes("performance") ||
    descriptionLower.includes("slow") ||
    descriptionLower.includes("speed")
  ) {
    return "PERFORMANCE";
  }

  if (
    categoryLower.includes("security") ||
    descriptionLower.includes("secure") ||
    descriptionLower.includes("auth")
  ) {
    return "SECURITY";
  }

  if (
    categoryLower.includes("access") ||
    descriptionLower.includes("accessibility") ||
    descriptionLower.includes("a11y")
  ) {
    return "ACCESSIBILITY";
  }

  return "FEATURE"; // Default to feature
}

function mapCategoryForRoadmap(
  category: string
):
  | "UI"
  | "BUG"
  | "FEATURE"
  | "IMPROVEMENT"
  | "TASK"
  | "DOCUMENTATION"
  | "REFACTOR"
  | "PERFORMANCE"
  | "DESIGN"
  | "SECURITY"
  | "ACCESSIBILITY"
  | "TESTING"
  | "INTERNATIONALIZATION" {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes("ui") || categoryLower.includes("design"))
    return "UI";
  if (categoryLower.includes("bug")) return "BUG";
  if (categoryLower.includes("performance")) return "PERFORMANCE";
  if (categoryLower.includes("security")) return "SECURITY";
  if (categoryLower.includes("access")) return "ACCESSIBILITY";
  if (categoryLower.includes("doc")) return "DOCUMENTATION";

  return "FEATURE";
}

function determineInitialStatus(
  priority: string
): "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED" | "CANCELLED" {
  // High priority items might start in progress, others in backlog
  return priority === "urgent" ? "IN_PROGRESS" : "BACKLOG";
}

function estimateTargetDate(priority: string): Date | null {
  const now = new Date();

  switch (priority) {
    case "urgent":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    case "high":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
    case "medium":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
    case "low":
      return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months
    default:
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months default
  }
}

function estimateBusinessValue(description: string, priority: string): number {
  // Simple heuristic based on priority and keywords
  let baseValue = 5; // Default medium value

  switch (priority) {
    case "urgent":
      baseValue = 9;
      break;
    case "high":
      baseValue = 7;
      break;
    case "medium":
      baseValue = 5;
      break;
    case "low":
      baseValue = 3;
      break;
  }

  // Boost value for certain keywords
  const highValueKeywords = [
    "revenue",
    "sales",
    "customer",
    "user experience",
    "conversion",
  ];
  const hasHighValueKeywords = highValueKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword)
  );

  if (hasHighValueKeywords) {
    baseValue = Math.min(10, baseValue + 2);
  }

  return baseValue;
}

function estimateEffort(description: string): number {
  // Simple heuristic based on description complexity
  const wordCount = description.split(/\s+/).length;
  const complexityKeywords = [
    "integration",
    "api",
    "database",
    "migration",
    "refactor",
    "architecture",
  ];

  let baseEffort = 3; // Default medium effort

  // Adjust based on word count (longer descriptions might indicate complexity)
  if (wordCount > 100) baseEffort += 2;
  else if (wordCount > 50) baseEffort += 1;

  // Adjust based on complexity keywords
  const hasComplexityKeywords = complexityKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword)
  );

  if (hasComplexityKeywords) {
    baseEffort += 3;
  }

  return Math.min(10, Math.max(1, baseEffort));
}
