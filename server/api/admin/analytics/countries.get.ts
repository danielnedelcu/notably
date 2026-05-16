import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "country" }, { name: "countryId" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 20,
  });

  return (
    response.rows?.map((row) => ({
      country: row.dimensionValues?.[0]?.value,
      countryCode: row.dimensionValues?.[1]?.value, // ISO 3166-1 alpha-2
      activeUsers: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    })) || []
  );
});
