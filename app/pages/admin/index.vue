<template>
  <div class="w-full">
    <div class="flex flex-row gap-2">
      <div class="w-full px-4 py-12">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="">Hello, Daniel!</h1>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="grid gap-4 sm:grid-cols-3">
            <ActiveViewsBarChart />
            <ActivePostsList />
          </div>

          <div class="flex flex-row gap-2 items-center justify-between py-2">
            <div class="flex flex-row gap-2 items-center">
              <h3>Posts</h3>
              <p class="text-sm text-gray-400 mt-1">
                ({{ response?.total ?? 0 }} total)
              </p>
            </div>
            <UiButton @click="navigateTo('/admin/posts/new')">
              <Icon name="lucide:plus" class="w-4 h-4" />
              New post
            </UiButton>
          </div>

          <!-- Filter tabs + Posts list -->
          <UiCard>
            <div class="bg-white p-4 rounded-lg">
              <UiTabs
                v-model="activeTab"
                default-value="all"
                @update:model-value="onTabChange"
              >
                <UiTabsList class="bg-transparent gap-2">
                  <UiTabsTrigger
                    v-for="tab in tabs"
                    :key="tab.value"
                    :value="tab.value"
                    class="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none gap-3"
                  >
                    <Icon v-if="tab.icon" :name="tab.icon" class="w-4 h-4" />
                    {{ tab.label }}
                    <UiBadge
                      class="px-2 text-xs tabular-nums bg-primary text-primary-foreground"
                      >{{ tabCount(tab.value) }}</UiBadge
                    >
                  </UiTabsTrigger>
                </UiTabsList>

                <UiSeparator class="my-4" />

                <UiTabsContent
                  v-for="tab in tabs"
                  :key="tab.value"
                  :value="tab.value"
                >
                  <!-- <UiItem as-child>
                    <NuxtLink href="#">
                      <UiItemMedia variant="icon">
                        <Icon name="lucide:file-text" />
                      </UiItemMedia>
                      <UiItemContent>
                        <UiItemTitle>Visit our documentation</UiItemTitle>
                        <UiItemDescription>
                          Published Mar 21, 2026
                        </UiItemDescription>
                      </UiItemContent>
                      <UiItemActions>
                        <Icon name="lucide:chevron-right" class="size-4" />
                      </UiItemActions>
                    </NuxtLink>
                  </UiItem> -->

                  <div
                    v-if="response?.posts?.length"
                    class="divide-y divide-gray-100 dark:divide-gray-800"
                  >
                    <UiItem
                      v-for="post in response.posts"
                      :key="post.id"
                      class="flex items-center justify-between py-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <UiItemMedia variant="icon">
                        <Icon name="lucide:file-text" />
                      </UiItemMedia>
                      <UiItemContent>
                        <NuxtLink
                          :to="`/admin/posts/${post.id}`"
                          class="text-md font-medium text-gray-900 dark:text-gray-100 truncate block"
                        >
                          <UiItemTitle
                            class="text-md font-normal text-gray-900 dark:text-gray-100 truncate block"
                          >
                            {{ post.title || "Untitled" }}</UiItemTitle
                          >
                        </NuxtLink>
                        <div
                          class="flex items-center gap-3 mt-1 font-roboto text-sm"
                        >
                          <UiBadge
                            :variant="
                              post.status === 'published'
                                ? 'default'
                                : 'secondary'
                            "
                            :class="
                              post.status === 'published'
                                ? 'bg-green-700 text-white dark:bg-blue-600'
                                : 'dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            "
                          >
                            <BadgeCheckIcon
                              v-if="post.status === 'published'"
                            />
                            <PencilIcon v-if="post.status === 'draft'" />
                            {{
                              post.status.charAt(0).toUpperCase() +
                              post.status.slice(1)
                            }}
                          </UiBadge>
                          <span class="text-xs text-gray-400 tabular-nums">
                            {{
                              formatDate(
                                post.status === "published"
                                  ? post.published_at
                                  : post.updated_at,
                              )
                            }}
                          </span>
                        </div>
                      </UiItemContent>

                      <div
                        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 z-10 relative"
                      >
                        <UiTooltip
                          v-if="post.status === 'published' && post.slug"
                        >
                          <UiTooltipTrigger as-child>
                            <NuxtLink
                              :to="`/posts/${post.slug}`"
                              target="_blank"
                              class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                              <SquareArrowOutUpRightIcon class="w-4 h-4" />
                            </NuxtLink>
                          </UiTooltipTrigger>
                          <UiTooltipContent class="dark"
                            >View post live</UiTooltipContent
                          >
                        </UiTooltip>

                        <UiTooltip>
                          <UiTooltipTrigger as-child>
                            <NuxtLink
                              :to="`/admin/posts/${post.id}`"
                              class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                              <EditIcon class="w-4 h-4" />
                            </NuxtLink>
                          </UiTooltipTrigger>
                          <UiTooltipContent class="dark"
                            >Edit post</UiTooltipContent
                          >
                        </UiTooltip>

                        <UiTooltip>
                          <UiTooltipTrigger as-child>
                            <UiButton
                              variant="ghost"
                              size="icon-sm"
                              class="text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors cursor-pointer"
                              @click="confirmDelete(post.id)"
                            >
                              <TrashIcon class="w-4 h-4" />
                            </UiButton>
                          </UiTooltipTrigger>
                          <UiTooltipContent class="dark"
                            >Delete post</UiTooltipContent
                          >
                        </UiTooltip>
                      </div>
                    </UiItem>
                  </div>

                  <div v-else class="py-16 text-center text-gray-400 text-sm">
                    {{
                      tab.value === "all"
                        ? "No posts yet. Create your first one."
                        : `No ${tab.value} posts.`
                    }}
                  </div>
                </UiTabsContent>
              </UiTabs>

              <UiSeparator
                v-if="response && response.totalPages > 1"
                class="my-4"
              />

              <!-- Pagination -->
              <UiPagination
                v-if="response && response.totalPages > 1"
                v-model:page="currentPage"
                :total="response.total"
                :items-per-page="response.pageSize"
                class="mt-8"
              >
                <UiPaginationList class="w-full justify-between">
                  <div class="text-sm text-muted-foreground">
                    Showing
                    <span class="text-foreground"
                      >{{ rangeStart }}–{{ rangeEnd }}</span
                    >
                    of
                    <span class="text-foreground">{{ response.total }}</span>
                    posts
                  </div>
                  <div class="flex items-center gap-3">
                    <UiPaginationPrev as-child>
                      <UiButton variant="outline" size="sm">
                        <span>Previous</span>
                      </UiButton>
                    </UiPaginationPrev>
                    <UiPaginationNext as-child>
                      <UiButton variant="outline" size="sm">
                        <span>Next</span>
                      </UiButton>
                    </UiPaginationNext>
                  </div>
                </UiPaginationList>
              </UiPagination>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <UiAlertDialog :open="!!postToDelete">
      <UiAlertDialogContent>
        <template #overlay>
          <UiAlertDialogOverlay class="bg-black/30" />
        </template>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle class="font-roboto text-xl"
            >Delete this post?</UiAlertDialogTitle
          >
          <UiAlertDialogDescription>
            This action cannot be undone. The post will be permanently deleted.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel @click="postToDelete = null" />
          <UiAlertDialogAction @click.prevent="handleDelete" />
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

<script setup lang="ts">
import type { Post } from "~/types/blog";
import ActiveViewsBarChart from "~/components/admin/ActiveViewsBarChart.vue";
import ActivePostsList from "~/components/admin/ActivePostsList.vue";
import {
  TrashIcon,
  BadgeCheckIcon,
  PencilIcon,
  EditIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-vue-next";
import type { ApexOptions } from "apexcharts";

const currentPage = ref(1);
const activeTab = ref<"all" | "published" | "draft">("all");
const postToDelete = ref<string | null>(null);

const { data: response, refresh } = await useFetch<{
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>("/api/admin/posts", {
  credentials: "include",
  query: computed(() => ({
    page: currentPage.value,
    status: activeTab.value,
  })),
  watch: [currentPage, activeTab],
});

const { data: counts, refresh: refreshCounts } = await useFetch<{
  all: number;
  published: number;
  draft: number;
}>("/api/admin/posts/counts", {
  credentials: "include",
});

const tabs = [
  { label: "All", value: "all", icon: "lucide:list-check" },
  { label: "Published", value: "published", icon: "lucide:badge-check" },
  { label: "Drafts", value: "draft", icon: "lucide:pencil" },
] as const;

// ── Tab counts ────────────────────────────────────────────────────────────────
// Since we're paginating, counts come from total on the current tab's response.
// For cross-tab counts we'd need separate requests — for now show current tab total.
const tabCount = (tab: string) => {
  if (!counts.value) return 0;
  return counts.value[tab as keyof typeof counts.value] ?? 0;
};

// ── Pagination ────────────────────────────────────────────────────────────────
const rangeStart = computed(() => {
  if (!response.value) return 0;
  return (response.value.page - 1) * response.value.pageSize + 1;
});

const rangeEnd = computed(() => {
  if (!response.value) return 0;
  return Math.min(
    response.value.page * response.value.pageSize,
    response.value.total,
  );
});

const onTabChange = (tab: string | number) => {
  activeTab.value = tab as "all" | "published" | "draft";
  currentPage.value = 1;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const confirmDelete = (id: string) => {
  postToDelete.value = id;
};

const handleDelete = async () => {
  if (!postToDelete.value) return;

  await $fetch(`/api/posts/${postToDelete.value}` as "/api/posts/:id", {
    method: "DELETE",
    credentials: "include",
  });
  postToDelete.value = null;
  await Promise.all([refresh(), refreshCounts()]);
};

const series = ref<ApexOptions["series"]>([
  {
    name: "Desktop",
    data: [
      { x: "January", y: 186 },
      { x: "February", y: 305 },
      { x: "March", y: 237 },
      { x: "April", y: 73 },
      { x: "May", y: 209 },
      { x: "June", y: 214 },
    ],
  },
]);

const options = ref<ApexOptions>({
  plotOptions: { bar: { borderRadius: 0, dataLabels: { position: "top" } } },
  dataLabels: {
    enabled: true,
    offsetY: -25,
    style: { colors: ["var(--color-foreground)"] },
  },
  colors: ["var(--color-blue-600)"],
  fill: { opacity: 1 },
  states: { hover: { filter: { type: "none" } } },
  yaxis: { labels: { show: false } },
  xaxis: { labels: { formatter: (value) => value?.slice(0, 3) } },
});
// Set page layout
definePageMeta({
  layout: "admin",
});
</script>
