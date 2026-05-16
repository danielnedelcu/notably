<template>
  <UiCard class="relative gap-0 overflow-hidden shadow-xs">
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <UiCardTitle>Most Active Posts</UiCardTitle>
        <!-- Reuses the same `useFetch` key as ActiveViewsBarChart — one network round-trip -->
        <UiButton
          variant="ghost"
          size="icon-sm"
          :disabled="pending"
          aria-label="Refresh most active posts"
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

    <UiCardContent
      class="aspect-auto max-h-100 w-full space-y-1 overflow-y-auto"
    >
      <div
        v-if="!topPosts.length"
        class="flex h-32 items-center justify-center rounded-md border border-dashed border-muted-foreground/25 text-sm text-muted-foreground"
      >
        No views recorded yet.
      </div>

      <UiItem v-for="post in topPosts" :key="post.id" as-child size="sm">
        <NuxtLink
          :to="post.slug ? `/posts/${post.slug}` : `/admin/posts/${post.id}`"
          :target="post.slug ? '_blank' : undefined"
          :rel="post.slug ? 'noopener noreferrer' : undefined"
        >
          <UiItemMedia variant="icon">
            <Icon name="lucide:file-text" />
          </UiItemMedia>
          <UiItemContent>
            <UiItemTitle>{{ post.title }}</UiItemTitle>
            <UiItemDescription>
              {{ formatViewLabel(post.views) }}
            </UiItemDescription>
          </UiItemContent>
          <UiItemActions>
            <Icon name="lucide:chevron-right" class="size-4" />
          </UiItemActions>
        </NuxtLink>
      </UiItem>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
/**
 * Admin card: lists top posts by view count from `GET /api/admin/analytics/pageviews`.
 *
 * Shares the same `useFetch` cache key as `ActiveViewsBarChart.vue`, so both widgets
 * reuse one response when rendered together (no duplicate `/pageviews` requests).
 *
 * The API already returns `topPosts` sorted by views (desc); we expose that list as-is.
 */
import type { PageviewsAnalytics } from "./ActiveViewsBarChart.vue";

const { data, pending, refresh } = await useFetch<PageviewsAnalytics>(
  "/api/admin/analytics/pageviews",
  {
    credentials: "include",
    key: "admin-analytics-pageviews-posts",
  },
);

/** Ordered by views descending from the API (top N). */
const topPosts = computed(() => data.value?.topPosts ?? []);

/** Localized count + “view” / “views” for the description line. */
function formatViewLabel(count: number) {
  const n = count.toLocaleString();
  return `${n} ${count === 1 ? "view" : "views"}`;
}
</script>
