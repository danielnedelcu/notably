<template>
  <UiCard class="col-span-2">
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <div>
          <UiCardTitle>Page Views</UiCardTitle>
          <UiCardDescription>Last 6 months</UiCardDescription>
        </div>
        <!-- Refetch analytics (spinning icon while useFetch is in flight) -->
        <UiButton
          variant="ghost"
          size="icon-sm"
          :disabled="pending"
          aria-label="Refresh page view stats"
          @click="refresh()"
        >
          <Icon
            name="lucide:refresh-cw"
            class="size-4"
            :class="{ 'animate-spin': pending }"
          />
        </UiButton>
      </div>
    </UiCardHeader>

    <UiCardContent class="aspect-auto h-[300px] w-full">
      <!-- ApexCharts is client-only (see Apexchart.client.vue); SSR shows fallback -->
      <ClientOnly>
        <UiApexchart
          v-if="showBarChart"
          type="bar"
          :series="series"
          :options="chartOptions"
        />
        <template #fallback>
          <div
            class="flex h-full min-h-[220px] items-center justify-center rounded-md border border-dashed border-muted-foreground/25 text-sm text-muted-foreground"
          >
            Loading chart…
          </div>
        </template>
      </ClientOnly>
    </UiCardContent>

    <UiCardFooter>
      <div class="flex w-full items-start gap-2 text-sm">
        <div class="grid gap-2">
          <div class="flex items-center gap-2 leading-none font-medium">
            {{ data?.last7Days ?? 0 }} views in the last 7 days
            <Icon name="lucide:trending-up" class="inline size-4" />
          </div>
          <div
            class="flex items-center gap-2 leading-none text-muted-foreground"
          >
            {{ data?.total ?? 0 }} total all-time views
          </div>
        </div>
      </div>
    </UiCardFooter>
  </UiCard>
</template>

<script setup lang="ts">
/**
 * Admin dashboard card: bar chart of page views aggregated by calendar month (rolling 6 months),
 * plus headline stats from `/api/admin/analytics/pageviews`.
 *
 * - Fetches aggregated analytics with the user session (`credentials: "include"`).
 * - Maps daily `byDay` buckets into monthly totals for the chart (same window as the API’s 6‑month query).
 * - defers chart rendering until after hydration (`ClientOnly` + `.client` chart component).
 */
import type { ApexOptions } from "apexcharts";

/** Mirrors `GET /api/admin/analytics/pageviews` JSON shape */
export type PageviewsAnalytics = {
  total: number;
  last7Days: number;
  last30Days: number;
  byDay: { date: string; count: number }[];
  topPosts: { id: string; title: string; slug: string; views: number }[];
};

const MONTHS = 6;

const { data, pending, refresh } = await useFetch<PageviewsAnalytics>(
  "/api/admin/analytics/pageviews",
  {
    credentials: "include",
    key: "admin-analytics-pageviews-chart",
  },
);

/**
 * Single-pass index: year-month key → total views for that month.
 * Avoids O(months × days) nested scans when folding `byDay` into the chart.
 */
const viewsByYearMonth = computed(() => {
  const map = new Map<string, number>();
  for (const { date, count } of data.value?.byDay ?? []) {
    const d = new Date(date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, (map.get(key) ?? 0) + count);
  }
  return map;
});

/**
 * Apex bar series: one series named “Views”, points `{ x: month label, y: count }`
 * for each of the last `MONTHS` calendar months (ending with the current month).
 */
const series = computed<ApexOptions["series"]>(() => {
  const now = new Date();
  const rows: { label: string; y: number }[] = [];

  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const y = viewsByYearMonth.value.get(key) ?? 0;
    rows.push({ label, y });
  }

  return [
    {
      name: "Views",
      data: rows.map(({ label, y }) => ({ x: label, y })),
    },
  ];
});

/** Show the chart only after load when there is at least one view (API `total`). */
const showBarChart = computed(() => (data.value?.total ?? 0) > 0);

/** Static Apex layout/theme; not mutated — plain object keeps SSR/client aligned */
const chartOptions: ApexOptions = {
  plotOptions: {
    bar: { borderRadius: 0, dataLabels: { position: "top" } },
  },
  dataLabels: {
    enabled: true,
    offsetY: -25,
    style: { colors: ["var(--color-foreground)"] },
  },
  colors: ["var(--color-blue-600)"],
  fill: { opacity: 1 },
  states: { hover: { filter: { type: "none" } } },
  yaxis: { labels: { show: false } },
  xaxis: {
    labels: {
      rotate: -45,
      style: { fontSize: "11px" },
    },
  },
};
</script>
