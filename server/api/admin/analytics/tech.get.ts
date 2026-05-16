import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [browsers, oses] = await Promise.all([
    client.runReport({
      property: getGA4Property(),
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: getGA4Property(),
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    }),
  ]);

  return {
    browsers:
      browsers[0].rows?.map((row) => ({
        browser: row.dimensionValues?.[0].value,
        activeUsers: Number(row.metricValues?.[0].value || 0),
        sessions: Number(row.metricValues?.[1].value || 0),
      })) || [],
    operatingSystems:
      oses[0].rows?.map((row) => ({
        os: row.dimensionValues?.[0].value,
        activeUsers: Number(row.metricValues?.[0].value || 0),
        sessions: Number(row.metricValues?.[1].value || 0),
      })) || [],
  };
});
