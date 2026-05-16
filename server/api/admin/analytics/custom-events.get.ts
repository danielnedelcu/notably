import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: ["post_liked", "post_shared", "post_read_complete"],
        },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  });

  return (
    response.rows?.map((row) => ({
      eventName: row.dimensionValues?.[0]?.value,
      eventCount: Number(row.metricValues?.[0]?.value || 0),
      totalUsers: Number(row.metricValues?.[1]?.value || 0),
    })) || []
  );
});
