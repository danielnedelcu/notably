import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
    metrics: [{ name: "sessions" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 15,
  });

  return (
    response.rows?.map((row) => ({
      source: row.dimensionValues?.[0].value, // e.g. 'google', '(direct)'
      medium: row.dimensionValues?.[1].value, // e.g. 'organic', '(none)', 'referral'
      sessions: Number(row.metricValues?.[0].value || 0),
      activeUsers: Number(row.metricValues?.[1].value || 0),
    })) || []
  );
});
