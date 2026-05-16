import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runRealtimeReport({
    property: getGA4Property(),
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
  });

  const totalActiveUsers =
    response.rows?.reduce(
      (sum, row) => sum + Number(row.metricValues?.[0]?.value || 0),
      0,
    ) || 0;

  const byCountry =
    response.rows?.map((row) => ({
      country: row.dimensionValues?.[0]?.value,
      activeUsers: Number(row.metricValues?.[0]?.value || 0),
    })) || [];

  return {
    totalActiveUsers,
    byCountry,
  };
});
