import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "averageSessionDuration" }, // seconds
      { name: "userEngagementDuration" }, // total seconds
      { name: "engagementRate" }, // 0–1 ratio
      { name: "screenPageViewsPerSession" },
    ],
  });

  const row = response.rows?.[0];

  return {
    activeUsers: Number(row?.metricValues?.[0]?.value || 0),
    sessions: Number(row?.metricValues?.[1]?.value || 0),
    engagedSessions: Number(row?.metricValues?.[2]?.value || 0),
    averageSessionDurationSeconds: Number(row?.metricValues?.[3]?.value || 0),
    totalEngagementSeconds: Number(row?.metricValues?.[4]?.value || 0),
    engagementRate: Number(row?.metricValues?.[5]?.value || 0),
    pageViewsPerSession: Number(row?.metricValues?.[6]?.value || 0),
  };
});
