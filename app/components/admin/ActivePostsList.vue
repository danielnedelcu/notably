<template>
  <UiCard class="relative gap-0 overflow-hidden shadow-xs">
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <UiCardTitle>Most Viewed Posts</UiCardTitle>
        <UiButton
          variant="ghost"
          size="icon-sm"
          :disabled="pending"
          aria-label="Refresh most active posts"
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

    <UiCardContent
      class="aspect-auto max-h-100 w-full space-y-1 overflow-y-auto"
    >
      <div
        v-if="!topPosts.length"
        class="flex h-32 items-center justify-center rounded-md border border-dashed border-muted-foreground/25 text-sm text-muted-foreground"
      >
        No views recorded yet.
      </div>

      <UiItem v-for="post in topPosts" :key="post.slug" as-child size="sm">
        <NuxtLink
          :to="`/posts/${post.slug}`"
          target="_blank"
          rel="noopener noreferrer"
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
 * Admin card: lists the top blog posts by page views over the last 180 days,
 * sourced from GA4 via /api/admin/analytics/top-posts.
 *
 * GA4 only knows URL paths and page titles — not database IDs. We extract the
 * slug from the path (e.g. "/posts/my-cool-post" → "my-cool-post") and link to
 * the public post page. If you need links to the admin edit view, you'd have
 * to enrich each row with a lookup against /api/posts/by-slug or similar.
 */
type TopPostRow = {
  path: string;
  slug: string;
  title: string;
  views: number;
  activeUsers: number;
};

const { data, pending, refresh } = await useFetch<TopPostRow[]>(
  "/api/admin/analytics/top-posts",
  {
    credentials: "include",
    key: "admin-analytics-top-posts",
    getCachedData: () => undefined,
  },
);

/** Already returned sorted by views desc from the API. */
const topPosts = computed(() => data.value ?? []);

/** Localized count + "view" / "views" for the description line. */
function formatViewLabel(count: number) {
  const n = count.toLocaleString();
  return `${n} ${count === 1 ? "view" : "views"}`;
}
</script>
