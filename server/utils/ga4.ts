import { BetaAnalyticsDataClient } from "@google-analytics/data";

let client: BetaAnalyticsDataClient | null = null;

export function getGA4Client() {
  if (!client) {
    const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_JSON!);
    client = new BetaAnalyticsDataClient({ credentials });
  }
  return client;
}

export function getGA4Property() {
  return `properties/${process.env.GA_PROPERTY_ID}`;
}
