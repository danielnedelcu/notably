import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });

  return (
    response.rows?.map((row) => ({
      path: row.dimensionValues?.[0].value,
      title: row.dimensionValues?.[1].value,
      pageViews: Number(row.metricValues?.[0].value || 0),
      activeUsers: Number(row.metricValues?.[1].value || 0),
    })) || []
  );
});
