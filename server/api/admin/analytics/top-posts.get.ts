import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runReport({
    property: getGA4Property(),
    dateRanges: [{ startDate: "180daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          matchType: "BEGINS_WITH",
          value: "/posts/",
        },
      },
    },
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });

  function humanizeSlug(slug: string) {
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    response.rows?.map((row) => {
      const path = row.dimensionValues?.[0]?.value || "";
      // Strip "/posts/" prefix and any trailing slash to get the slug
      const slug = path.replace(/^\/posts\//, "").replace(/\/$/, "");
      return {
        path,
        slug,
        title: row.dimensionValues?.[1]?.value || humanizeSlug(slug),
        views: Number(row.metricValues?.[0]?.value || 0),
        activeUsers: Number(row.metricValues?.[1]?.value || 0),
      };
    }) || []
  );
});
