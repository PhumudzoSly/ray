import type {
  IdeaStatus,
  ProjectPlatform,
  ProjectStatus,
  IssueStatus,
  IssueLabel,
  Importance,
} from "../prisma/generated/client";
import { prisma } from "../prisma/prisma";

interface DemoDataOptions {
  organizationId: string;
  userId: string;
}

/**
 * Seeds demo data for a new organization
 * Creates 2 ideas, 4 projects, 4 issues, 2 waitlists, and 2 roadmaps
 * Handles proper entity relationships and optimizes database queries
 */
export async function seedDemoData({
  organizationId,
  userId,
}: DemoDataOptions) {
  try {
    console.log(
      `Starting demo data seeding for organization: ${organizationId}`
    );

    // Create entities in the correct order to handle relationships
    // 1. First create ideas (no dependencies)
    const ideas = await createDemoIdeas(organizationId, userId);

    // 2. Then create projects (depend on ideas)
    const projects = await createDemoProjects(organizationId, userId, ideas);

    // 3. Create issues, waitlists, and roadmaps (depend on projects) in parallel
    await Promise.all([
      createDemoIssues(organizationId, userId, projects),
      createDemoWaitlists(organizationId, userId, projects),
      createDemoRoadmaps(organizationId, userId, projects),
    ]);

    console.log(
      `Demo data seeding completed for organization: ${organizationId}`
    );

    return { success: true };
  } catch (error) {
    console.error(
      `Failed to seed demo data for organization ${organizationId}:`,
      error
    );
    throw error;
  }
}

/**
 * Creates 2 demo ideas for the organization
 * Uses createMany for optimized batch insertion
 */
async function createDemoIdeas(organizationId: string, userId: string) {
  const demoIdeas = [
    {
      name: "AI-Powered Task Manager",
      description:
        "A smart task management application that uses AI to prioritize tasks, suggest optimal work schedules, and provide productivity insights. Perfect for busy professionals and teams looking to maximize their efficiency.",
      industry: "Productivity Software",
      internal: true,
      openSource: false,
      status: "VALIDATED" as IdeaStatus,
      aiOverallValidation: 8.5,
      problemSolved:
        "People struggle with task prioritization and time management in their daily work",
      solutionOffered:
        "AI-driven task prioritization and intelligent scheduling recommendations",
      organizationId,
      ownerId: userId,
    },
    {
      name: "Sustainable Food Delivery Platform",
      description:
        "An eco-friendly food delivery service that connects users with local restaurants committed to sustainable practices. Features carbon footprint tracking, reusable packaging options, and local sourcing transparency.",
      industry: "Food & Beverage",
      internal: false,
      openSource: true,
      status: "IN_PROGRESS" as IdeaStatus,
      aiOverallValidation: 7.2,
      problemSolved:
        "Traditional food delivery creates excessive waste and environmental impact",
      solutionOffered:
        "Sustainable delivery network with eco-friendly packaging and local sourcing",
      organizationId,
      ownerId: userId,
    },
  ];

  // Use createMany for better performance, then fetch the created records
  await prisma.idea.createMany({
    data: demoIdeas,
  });

  // Fetch the created ideas to return with IDs for relationship linking
  const createdIdeas = await prisma.idea.findMany({
    where: {
      organizationId,
      name: {
        in: demoIdeas.map((idea) => idea.name),
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return createdIdeas;
}

/**
 * Creates 4 demo projects for the organization (2 linked to ideas, 2 standalone)
 * Uses createMany for optimized batch insertion
 */
async function createDemoProjects(
  organizationId: string,
  userId: string,
  ideas: any[]
) {
  const demoProjects = [
    {
      name: "TaskMaster Pro",
      description:
        "MVP development for the AI-powered task management application",
      platform: "web" as ProjectPlatform,
      ai: "OpenAI",
      orm: "Prisma",
      database: "PostgreSQL",
      auth: "NextAuth.js",
      framework: "Next.js",
      infrastructure: "Vercel",
      status: "in_progress" as ProjectStatus,
      ideaId: ideas[0]?.id,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      organizationId,
      createdById: userId,
    },
    {
      name: "EcoEats Mobile App",
      description:
        "Mobile application for the sustainable food delivery platform",
      platform: "mobile" as ProjectPlatform,
      ai: "Google AI",
      orm: "TypeORM",
      database: "MongoDB",
      auth: "Firebase Auth",
      framework: "React Native",
      infrastructure: "AWS",
      status: "planning" as ProjectStatus,
      ideaId: ideas[1]?.id,
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      organizationId,
      createdById: userId,
    },
    {
      name: "Company Website Redesign",
      description:
        "Complete redesign of the company website with modern UI/UX and improved performance",
      platform: "web" as ProjectPlatform,
      framework: "Next.js",
      database: "PostgreSQL",
      auth: "Auth0",
      infrastructure: "Netlify",
      status: "review" as ProjectStatus,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      organizationId,
      createdById: userId,
    },
    {
      name: "Internal Analytics Dashboard",
      description:
        "Business intelligence dashboard for tracking key metrics and performance indicators",
      platform: "web" as ProjectPlatform,
      ai: "TensorFlow",
      orm: "Prisma",
      database: "PostgreSQL",
      framework: "React",
      infrastructure: "Docker",
      status: "completed" as ProjectStatus,
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      organizationId,
      createdById: userId,
    },
  ];

  // Use createMany for better performance, then fetch the created records
  await prisma.project.createMany({
    data: demoProjects,
  });

  // Fetch the created projects to return with IDs for relationship linking
  const createdProjects = await prisma.project.findMany({
    where: {
      organizationId,
      name: {
        in: demoProjects.map((project) => project.name),
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return createdProjects;
}

/**
 * Creates 4 demo issues distributed across projects
 * Uses createMany for optimized batch insertion
 */
async function createDemoIssues(
  organizationId: string,
  userId: string,
  projects: any[]
) {
  const demoIssues = [
    {
      title: "Implement user authentication system",
      description:
        "Set up secure user authentication with JWT tokens, password hashing, and session management.",
      status: "IN_PROGRESS" as IssueStatus,
      priority: "HIGH" as Importance,
      label: "FEATURE" as IssueLabel,
      organizationId,
      projectId: projects[0]?.id, // TaskMaster Pro
      assigneeId: userId,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      title: "Fix mobile responsiveness issues",
      description:
        "Address layout problems on mobile devices, particularly with the navigation menu and form inputs.",
      status: "BACKLOG" as IssueStatus,
      priority: "MEDIUM" as Importance,
      label: "BUG" as IssueLabel,
      organizationId,
      projectId: projects[2]?.id, // Company Website Redesign
      assigneeId: userId,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    },
    {
      title: "Design restaurant onboarding flow",
      description:
        "Create wireframes and mockups for the restaurant partner onboarding process in the EcoEats platform.",
      status: "IN_REVIEW" as IssueStatus,
      priority: "HIGH" as Importance,
      label: "DESIGN" as IssueLabel,
      organizationId,
      projectId: projects[1]?.id, // EcoEats Mobile App
      assigneeId: userId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      title: "Optimize database queries",
      description:
        "Improve performance of analytics queries by adding proper indexes and optimizing complex joins.",
      status: "COMPLETED" as IssueStatus,
      priority: "MEDIUM" as Importance,
      label: "IMPROVEMENT" as IssueLabel,
      organizationId,
      projectId: projects[3]?.id, // Internal Analytics Dashboard
      assigneeId: userId,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (completed)
    },
  ];

  // Use createMany for better performance
  await prisma.issue.createMany({
    data: demoIssues,
  });

  console.log(`Created ${demoIssues.length} demo issues`);
}

/**
 * Creates 2 demo waitlists linked to projects
 * Uses createMany for optimized batch insertion
 */
async function createDemoWaitlists(
  organizationId: string,
  userId: string,
  projects: any[]
) {
  const demoWaitlists = [
    {
      name: "TaskMaster Pro Beta Access",
      description:
        "Get early access to our AI-powered task management platform before the official launch.",
      isPublic: true,
      collectEmail: true,
      collectName: true,
      collectCompany: false,
      enablePositionTracking: true,
      organizationId,
      projectId: projects[0]?.id, // TaskMaster Pro
      createdById: userId,
    },
    {
      name: "EcoEats Launch Notification",
      description:
        "Be the first to know when EcoEats launches in your area and get exclusive early-bird discounts.",
      isPublic: true,
      collectEmail: true,
      collectName: true,
      collectCompany: false,
      enablePositionTracking: false,
      organizationId,
      projectId: projects[1]?.id, // EcoEats Mobile App
      createdById: userId,
    },
  ];

  // Use createMany for better performance
  await prisma.waitlist.createMany({
    data: demoWaitlists.map((waitlist) => ({
      ...waitlist,
      slug: waitlist.name.toLowerCase().replace(/\s+/g, "-"),
      allowNameCapture: waitlist.collectName,
      showPosition: waitlist.enablePositionTracking,
      showSocialProof: true,
    })),
  });

  console.log(`Created ${demoWaitlists.length} demo waitlists`);
}

/**
 * Creates 2 demo public roadmaps linked to projects
 * Uses createMany for optimized batch insertion
 */
async function createDemoRoadmaps(
  organizationId: string,
  userId: string,
  projects: any[]
) {
  const demoRoadmaps = [
    {
      name: "TaskMaster Pro Roadmap",
      description:
        "Follow our journey as we build the future of AI-powered task management.",
      isPublic: true,
      allowVoting: true,
      allowFeedback: true,
      organizationId,
      projectId: projects[0]?.id, // TaskMaster Pro
      createdById: userId,
    },
    {
      name: "EcoEats Development Roadmap",
      description:
        "Track the development progress of our sustainable food delivery platform.",
      isPublic: true,
      allowVoting: false,
      allowFeedback: true,
      organizationId,
      projectId: projects[1]?.id, // EcoEats Mobile App
      createdById: userId,
    },
  ];

  // Use createMany for better performance
  await prisma.publicRoadmap.createMany({
    data: demoRoadmaps.map((roadmap) => ({
      ...roadmap,
      slug: roadmap.name.toLowerCase().replace(/\s+/g, "-"),
    })),
  });

  console.log(`Created ${demoRoadmaps.length} demo roadmaps`);
}

/**
 * Checks if an organization needs demo data seeding
 * Returns true if the organization has no ideas, projects, issues, waitlists, or roadmaps
 */
export async function shouldSeedDemoData(
  organizationId: string
): Promise<boolean> {
  try {
    const [ideaCount, projectCount, issueCount, waitlistCount, roadmapCount] =
      await Promise.all([
        prisma.idea.count({ where: { organizationId } }),
        prisma.project.count({ where: { organizationId } }),
        prisma.issue.count({ where: { organizationId } }),
        prisma.waitlist.count({ where: { organizationId } }),
        prisma.publicRoadmap.count({
          where: {
            project: { organizationId },
          },
        }),
      ]);

    // If all counts are 0, the organization needs demo data
    return (
      ideaCount === 0 &&
      projectCount === 0 &&
      issueCount === 0 &&
      waitlistCount === 0 &&
      roadmapCount === 0
    );
  } catch (error) {
    console.error("Error checking if demo data is needed:", error);
    return false;
  }
}

/**
 * Checks if a user is a member of any other organization
 */
export async function isUserMemberOfOtherOrgs(
  userId: string,
  currentOrgId: string
): Promise<boolean> {
  try {
    const memberCount = await prisma.member.count({
      where: {
        userId,
        organizationId: {
          not: currentOrgId,
        },
      },
    });

    return memberCount > 0;
  } catch (error) {
    console.error(
      "Error checking user membership in other organizations:",
      error
    );
    return false;
  }
}
