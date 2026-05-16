import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "newVsReturning" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }],
  });

  // GA4 returns userType as 'new' or 'returning' (sometimes 'not set')
  return (
    response.rows?.map((row) => ({
      userType: row.dimensionValues?.[0]?.value, // 'new' | 'returning' | '(not set)'
      activeUsers: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    })) || []
  );
});
