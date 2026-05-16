import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [
      { name: "eventName" },
      { name: "customEvent:post_id" },
      { name: "customEvent:post_title" },
    ],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: ["post_liked", "post_shared", "post_read_complete"],
        },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 50,
  });

  return (
    response.rows?.map((row) => ({
      eventName: row.dimensionValues?.[0].value,
      postId: row.dimensionValues?.[1].value,
      postTitle: row.dimensionValues?.[2].value,
      eventCount: Number(row.metricValues?.[0].value || 0),
    })) || []
  );
});
