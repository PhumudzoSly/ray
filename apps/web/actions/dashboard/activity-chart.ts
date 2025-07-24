"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

interface ActivityDataPoint {
  date: string;
  issues: number;
  features: number;
}

interface DailyActivityCount {
  date: string;
  count: number;
}

export const getActivityChartData = async (): Promise<ActivityDataPoint[]> => {
  const { org } = await getSession();

  // Calculate date range for past 30 days
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of today
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29); // 30 days total including today
  startDate.setHours(0, 0, 0, 0); // Start of day

  // Debug: Check total activities in the organization
  const totalActivities = await prisma.activityFeed.count({
    where: { organizationId: org },
  });

  console.log(`Total activities for org ${org}: ${totalActivities}`);
  console.log(
    `Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  // Debug: Get some sample activities to understand the data structure
  if (totalActivities > 0) {
    const sampleActivities = await prisma.activityFeed.findMany({
      where: { organizationId: org },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
    console.log("Sample activities:", sampleActivities);
  }

  // Generate array of all dates in the range
  const dateArray: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0];
    if (dateString) {
      dateArray.push(dateString);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Try raw SQL queries first, fallback to regular Prisma queries if they fail
  let issueActivities: DailyActivityCount[] = [];
  let featureActivities: DailyActivityCount[] = [];

  try {
    [issueActivities, featureActivities] = await Promise.all([
      prisma.$queryRaw<DailyActivityCount[]>`
        SELECT 
          ("createdAt"::date)::text as date,
          COUNT(*)::int as count
        FROM "ActivityFeed"
        WHERE "organizationId" = ${org}
          AND "entityType" = 'ISSUE'
          AND "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
        GROUP BY "createdAt"::date
        ORDER BY date
      `,
      prisma.$queryRaw<DailyActivityCount[]>`
        SELECT 
          ("createdAt"::date)::text as date,
          COUNT(*)::int as count
        FROM "ActivityFeed"
        WHERE "organizationId" = ${org}
          AND "entityType" = 'FEATURE'
          AND "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
        GROUP BY "createdAt"::date
        ORDER BY date
      `,
    ]);
  } catch (rawQueryError) {
    console.log(
      "Raw SQL failed, falling back to regular queries:",
      rawQueryError
    );

    // Fallback to regular Prisma queries
    const [issueData, featureData] = await Promise.all([
      prisma.activityFeed.findMany({
        where: {
          organizationId: org,
          entityType: "ISSUE",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.activityFeed.findMany({
        where: {
          organizationId: org,
          entityType: "FEATURE",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Group by date manually
    const groupByDate = (activities: { createdAt: Date }[]) => {
      const grouped: Record<string, number> = {};
      activities.forEach((activity) => {
        const date = activity.createdAt.toISOString().split("T")[0];
        if (date) {
          grouped[date] = (grouped[date] || 0) + 1;
        }
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    };

    issueActivities = groupByDate(issueData);
    featureActivities = groupByDate(featureData);
  }

  console.log("Issue activities:", issueActivities);
  console.log("Feature activities:", featureActivities);
  console.log("Generated date array:", dateArray);

  // Convert to lookup objects
  const issueCountsByDate = (issueActivities as DailyActivityCount[]).reduce(
    (acc, activity) => {
      acc[activity.date] = Number(activity.count);
      return acc;
    },
    {} as Record<string, number>
  );

  const featureCountsByDate = (
    featureActivities as DailyActivityCount[]
  ).reduce(
    (acc, activity) => {
      acc[activity.date] = Number(activity.count);
      return acc;
    },
    {} as Record<string, number>
  );

  // Create data points for all dates, including empty days
  const chartData: ActivityDataPoint[] = dateArray.map((date) => ({
    date,
    issues: issueCountsByDate[date] || 0,
    features: featureCountsByDate[date] || 0,
  }));

  return chartData;
};
