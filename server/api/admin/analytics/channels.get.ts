import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "engagedSessions" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  return (
    response.rows?.map((row) => ({
      channel: row.dimensionValues?.[0].value, // e.g. 'Organic Search', 'Direct', 'Social'
      sessions: Number(row.metricValues?.[0].value || 0),
      activeUsers: Number(row.metricValues?.[1].value || 0),
      engagedSessions: Number(row.metricValues?.[2].value || 0),
    })) || []
  );
});
