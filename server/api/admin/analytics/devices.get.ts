import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
  });

  return (
    response.rows?.map((row) => ({
      device: row.dimensionValues?.[0].value, // 'mobile' | 'desktop' | 'tablet'
      activeUsers: Number(row.metricValues?.[0].value || 0),
      sessions: Number(row.metricValues?.[1].value || 0),
    })) || []
  );
});
