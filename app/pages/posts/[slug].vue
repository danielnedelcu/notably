<template>
  <div class="relative mx-auto max-w-6xl px-4 pb-12 pt-20">
    <!-- Reading progress indicator (scroll-linked) -->
    <ScrollProgress />

    <!-- Site navigation -->
    <NuxtLink
      to="/"
      class="mb-0 inline-block text-sm text-gray-400 hover:text-gray-600"
    >
      ← Back to posts
    </NuxtLink>

    <article v-if="post">
      <!-- Hero: title, publication line, taxonomy -->
      <div class="py-18">
        <div class="mx-auto flex max-w-3xl flex-col gap-6">
          <h1 class="text-center text-4xl">{{ post.title }}</h1>

          <div class="mx-auto mb-8 flex flex-col items-center gap-4">
            <p v-if="publishedLabel" class="text-sm text-gray-400">
              {{ publishedLabel }}
            </p>

            <div class="flex flex-col items-center gap-4">
              <div
                v-if="categories?.length"
                class="flex flex-row items-center gap-4"
              >
                <p>Categories:</p>
                <div class="flex items-center gap-1.5">
                  <UiBadge
                    v-for="cat in categories"
                    :key="cat.id"
                    variant="default"
                  >
                    {{ cat.name }}
                  </UiBadge>
                </div>
              </div>

              <div v-if="tags?.length" class="flex flex-row items-center gap-4">
                <p>Tags:</p>
                <UiBadge v-for="tag in tags" :key="tag.id" variant="outline">
                  #{{ tag.name }}
                </UiBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cover image (optional) -->
      <img
        v-if="post.cover_image"
        :src="post.cover_image"
        :alt="post.title"
        class="mb-8 h-[450px] w-full rounded-lg object-cover"
      />

      <!-- Body: Editor.js JSON rendered to HTML (see `renderEditorJS`) -->
      <div class="mx-auto max-w-3xl py-4">
        <div class="prose prose-gray max-w-none" v-html="renderedContent" />
      </div>

      <!-- Likes: optimistic toggle via POST /likes -->
      <div class="mt-12 flex items-center gap-3">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
          :class="
            liked
              ? 'border-red-300 bg-red-50 text-red-500'
              : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
          "
          :disabled="likeBusy || !post?.id"
          @click="toggleLike"
        >
          <Icon
            name="lucide:heart"
            class="h-4 w-4"
            :class="{ 'fill-red-500': liked }"
          />
          <span class="text-sm font-medium">{{ likeCount }}</span>
        </button>
        <span class="text-sm text-gray-400">{{
          liked ? "Thanks for the like!" : "Like this post?"
        }}</span>
      </div>
    </article>

    <p v-else class="text-gray-500">Post not found.</p>
  </div>
</template>

<script setup lang="ts">
/**
 * Public blog post page (`/posts/:slug`).
 *
 * Responsibilities:
 * - Load post by slug (SSR + client).
 * - Load likes, categories, and tags only when a post exists (avoids `/api/posts/undefined/...`).
 * - Render stored Editor.js JSON as HTML for article body.
 * - Record a page view once on mount (client-only beacon).
 * - Sync document title / OG tags from post metadata.
 */
import type { Post } from "~/types/blog";
import ScrollProgress from "~/components/ScrollProgress.vue";
import { useAnalytics } from "~/composables/useAnalytics";
const { trackPostLiked } = useAnalytics();

/** Row shape returned by categories/tags APIs */
type TaxonomyRow = { id: string; name: string };

const route = useRoute();
const slug = route.params.slug as string;

/** Primary payload: single published (or visible) post by slug */
const { data: post } = await useFetch<Post>(`/api/posts/${slug}`, {
  key: `public-post-${slug}`,
});

/**
 * Secondary data depends on `post.id`. Skipped entirely when the slug 404s so we never
 * request `/api/posts/undefined/...` during SSR or navigation.
 */
const likesData = ref<{ liked: boolean; count: number } | null>(null);
const categories = ref<TaxonomyRow[] | null>(null);
const tags = ref<TaxonomyRow[] | null>(null);

if (post.value?.id) {
  const id = post.value.id;
  const [likesRes, categoriesRes, tagsRes] = await Promise.all([
    useFetch<{ liked: boolean; count: number }>(`/api/posts/${id}/likes`, {
      key: `public-post-${id}-likes`,
    }),
    useFetch<TaxonomyRow[]>(`/api/posts/${id}/categories`, {
      key: `public-post-${id}-categories`,
    }),
    useFetch<TaxonomyRow[]>(`/api/posts/${id}/tags`, {
      key: `public-post-${id}-tags`,
    }),
  ]);

  likesData.value = likesRes.data.value ?? null;
  categories.value = categoriesRes.data.value ?? null;
  tags.value = tagsRes.data.value ?? null;
}

/** Like button UI state (initialized from likes payload when present) */
const liked = ref(likesData.value?.liked ?? false);
const likeCount = ref(likesData.value?.count ?? 0);
const likeBusy = ref(false);

/**
 * Human-readable publish line; prefers `published_at`, falls back to `updated_at`.
 */
const publishedLabel = computed(() => {
  const raw = post.value?.published_at ?? post.value?.updated_at;
  if (!raw) return "";
  return new Date(raw).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

/**
 * Converts stored Editor.js JSON string into HTML for `v-html`.
 * Trust boundary: content is assumed authored in your editor pipeline (still sanitize server-side if you accept untrusted input).
 */
const renderedContent = computed(() =>
  post.value?.content ? renderEditorJS(post.value.content) : "",
);

/**
 * POST /likes toggles user like and returns authoritative counts from the server.
 */
async function toggleLike() {
  const id = post.value?.id;
  if (!id || likeBusy.value) return;
  likeBusy.value = true;
  try {
    const result = await $fetch<{ liked: boolean; count: number }>(
      `/api/posts/${id}/likes`,
      { method: "POST" },
    );
    liked.value = result.liked;
    likeCount.value = result.count;

    // Fire analytics event only on a new like, not unlike
    if (result.liked && post.value?.title) {
      trackPostLiked(id, post.value.title);
    }
  } finally {
    likeBusy.value = false;
  }
}

/**
 * Fire-and-forget view increment for analytics. Runs only in the browser after hydration;
 * failures are ignored so metrics never break reading experience.
 */
onMounted(() => {
  const id = post.value?.id;
  if (!id) return;
  $fetch(`/api/posts/${id}/view`, { method: "POST" }).catch(() => {});
});

/** Reactive head tags for SEO / social previews */
useHead(() => ({
  title: post.value?.title ?? "Post",
  meta: [
    { name: "description", content: post.value?.excerpt ?? "" },
    { property: "og:title", content: post.value?.title ?? "" },
    { property: "og:description", content: post.value?.excerpt ?? "" },
    { property: "og:image", content: post.value?.cover_image ?? "" },
  ],
}));
</script>
