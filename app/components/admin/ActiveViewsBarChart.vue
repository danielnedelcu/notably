<template>
  <UiCard class="col-span-2">
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <div>
          <UiCardTitle>Page Views</UiCardTitle>
          <UiCardDescription>Last 6 months</UiCardDescription>
        </div>
        <UiButton
          variant="ghost"
          size="icon-sm"
          :disabled="pending"
          aria-label="Refresh page view stats"
          @click="refresh"
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
            {{ last7Days }} views in the last 7 days
            <Icon name="lucide:trending-up" class="inline size-4" />
          </div>
          <div
            class="flex items-center gap-2 leading-none text-muted-foreground"
          >
            {{ total }} total views (last 6 months)
          </div>
        </div>
      </div>
    </UiCardFooter>
  </UiCard>
</template>

<script setup lang="ts">
/**
 * Admin dashboard card: bar chart of page views aggregated by calendar month
 * (rolling 6 months), sourced from GA4 via /api/admin/analytics/pageviews.
 *
 * The GA4 endpoint returns one row per day in `YYYYMMDD` format:
 *   [{ date: "20260516", pageViews: 8, activeUsers: 1 }, ...]
 *
 * We aggregate these daily rows into monthly totals for the chart, and compute
 * the "last 7 days" and "total" headline stats client-side.
 */
import type { ApexOptions } from "apexcharts";

/** Shape of each row returned by GET /api/admin/analytics/pageviews */
type PageviewRow = {
  date: string; // YYYYMMDD
  pageViews: number;
  activeUsers: number;
};

const MONTHS = 6;

const { data, pending, refresh } = await useFetch<PageviewRow[]>(
  "/api/admin/analytics/pageviews",
  {
    credentials: "include",
    key: "admin-analytics-pageviews-chart",
    getCachedData: () => undefined,
  },
);

/**
 * Parse GA4's compact YYYYMMDD date string into a Date object.
 * GA4 doesn't return ISO dates here, so manual slicing is the cleanest path.
 */
function parseGA4Date(yyyymmdd: string): Date {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1; // 0-indexed
  const day = Number(yyyymmdd.slice(6, 8));
  return new Date(year, month, day);
}

/** All daily rows, normalized once for downstream computeds */
const rows = computed(() => data.value ?? []);

/**
 * Single-pass index: year-month key → total page views for that month.
 * Mirrors the old `viewsByYearMonth` map but reads `pageViews` instead of `count`.
 */
const viewsByYearMonth = computed(() => {
  const map = new Map<string, number>();
  for (const { date, pageViews } of rows.value) {
    const d = parseGA4Date(date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, (map.get(key) ?? 0) + pageViews);
  }
  return map;
});

/** Total views across the entire returned window (used in footer) */
const total = computed(() =>
  rows.value.reduce((sum, r) => sum + r.pageViews, 0),
);

/**
 * Last 7 days of views. Filters rows whose parsed date is within 7 days of today.
 * Done off the same array so it always reflects the latest fetch.
 */
const last7Days = computed(() => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  cutoff.setHours(0, 0, 0, 0);
  return rows.value
    .filter((r) => parseGA4Date(r.date) >= cutoff)
    .reduce((sum, r) => sum + r.pageViews, 0);
});

/**
 * Apex bar series: one series named "Views", points `{ x: month label, y: count }`
 * for each of the last MONTHS calendar months (ending with the current month).
 */
const series = computed<ApexOptions["series"]>(() => {
  const now = new Date();
  const out: { x: string; y: number }[] = [];

  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    out.push({ x: label, y: viewsByYearMonth.value.get(key) ?? 0 });
  }

  return [{ name: "Views", data: out }];
});

/** Hide the chart entirely when there's no data to plot */
const showBarChart = computed(() => total.value > 0);

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
  colors: ["var(--color-pink-600)"],
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
