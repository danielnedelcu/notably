import { getGA4Client, getGA4Property } from "~~/server/utils/ga4";

export default defineEventHandler(async () => {
  const client = getGA4Client();

  const [response] = await client.runRealtimeReport({
    property: getGA4Property(),
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
  });

  return (
    response.rows?.map((row) => ({
      eventName: row.dimensionValues?.[0].value,
      eventCount: Number(row.metricValues?.[0].value || 0),
    })) || []
  );
});
