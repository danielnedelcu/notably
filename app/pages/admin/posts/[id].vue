<template>
  <div class="flex h-screen bg-white dark:bg-gray-950">
    <FadeTransition>
      <div
        v-if="showMeta"
        class="fixed inset-0 bg-black/30 dark:bg-black/50 z-20 pointer-events-none"
      />
    </FadeTransition>

    <!-- Main editor -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <AdminEditorHeader
        :saving="saving"
        :last-saved="lastSaved"
        :time-ago="timeAgo"
        :post-status="postStatus"
        :resolved-id="resolvedId"
        :publishing="publishing"
        :unpublishing="unpublishing"
        :has-pending-changes="hasPendingChanges"
        :scheduled-at="scheduledAt"
        :slug-is-valid="slugIsValid"
        @toggle-meta="showMeta = !showMeta"
        @publish="publish"
        @unpublish="unpublish"
      />

      <!-- Editor area -->
      <div class="flex-1 overflow-auto">
        <div class="max-w-3xl mx-auto px-8 py-12">
          <!-- Generate bar -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showGenerateBar"
              ref="generateBarPanelRef"
              class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-xl"
            >
              <AdminGenerateBar
                ref="generateBarComposeRef"
                @generated="onGenerated"
                @error="onGenerateError"
              />
            </div>
          </Transition>

          <textarea
            v-model="title"
            rows="1"
            placeholder="Untitled"
            class="w-full bg-transparent text-3xl font-dm-serif-display font-medium tracking-tight text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none mb-6 resize-none overflow-hidden break-words [field-sizing:content]"
            @input="autoSave"
            @keydown.enter.prevent
          />
          <EditorJS
            :key="editorKey"
            v-model="content"
            @update:model-value="autoSave"
          />
        </div>
      </div>

      <!-- Generate with AI button -->
      <AdminGenerateAIButton
        :has-user-content="hasUserContent"
        :show-generate-bar="showGenerateBar"
        @click="showGenerateBar = true"
      />

      <!-- Footer -->
      <AdminEditorFooter :word-count="wordCount" :read-time="readTime" />
    </div>

    <!-- Metadata panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <aside
        v-if="showMeta"
        ref="metaPanelRef"
        class="fixed top-4 right-4 h-[calc(100vh-2rem)] w-[450px] bg-white dark:bg-gray-950 z-30 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_6px_1px_rgba(0,0,0,0.1)]"
      >
        <!-- Header — fixed, never scrolls -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0"
        >
          <h3 class="text-md font-medium text-gray-900 dark:text-gray-100">
            Post details
          </h3>
          <UiButton
            variant="outline"
            size="icon"
            class="rounded-full"
            @click="showMeta = false"
          >
            <ArrowRightIcon class="w-4 h-4" />
          </UiButton>
        </div>

        <!-- Scrollable middle -->
        <UiScrollArea class="flex-1 min-h-0">
          <div class="flex flex-col gap-4 px-5 py-5 space-y-5">
            <AdminSlugInput
              v-model="slug"
              :post-id="resolvedId"
              @valid="slugIsValid = $event"
            />

            <div class="flex flex-col space-y-1.5 m-0 gap-1">
              <label class="text-xs text-gray-500">Excerpt</label>
              <textarea
                v-model="excerpt"
                placeholder="A brief summary…"
                class="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none min-h-[80px]"
                @blur="saveIfChanged('excerpt')"
              />
            </div>

            <AdminCoverImageUpload
              v-model="coverImage"
              @update:model-value="autoSave"
            />

            <div class="flex flex-col space-y-1.5 m-0 gap-1">
              <label class="text-xs text-gray-500"
                >Categories (comma separated)</label
              >
              <input
                v-model="categoriesInput"
                type="text"
                placeholder="tutorials, web-dev"
                class="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                @blur="saveMetaIfChanged"
              />
            </div>

            <div class="flex flex-col space-y-1.5 m-0 gap-1">
              <label class="text-xs text-gray-500"
                >Tags (comma separated)</label
              >
              <input
                v-model="tagsInput"
                type="text"
                placeholder="vue, nuxt, typescript"
                class="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                @blur="saveMetaIfChanged"
              />
            </div>

            <UiItem variant="muted" class="mb-0">
              <UiItemContent>
                <UiItemTitle>
                  Status:
                  <span
                    class="capitalize font-medium"
                    :class="{
                      'text-green-600': postStatus === 'published',
                      'text-gray-600': postStatus === 'draft',
                    }"
                    >{{ postStatus }}</span
                  >
                </UiItemTitle>
                <UiItemDescription>
                  <p
                    v-if="post?.published_at"
                    class="text-xs text-gray-400 tabular-nums"
                  >
                    <ClockPlusIcon
                      class="w-4 h-4 inline-block mr-1 vertical-align-middle text-gray-600 mr-2"
                    />
                    Published
                    {{
                      new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }}
                  </p>
                </UiItemDescription>
              </UiItemContent>
            </UiItem>

            <UiAccordion
              type="single"
              collapsible
              class="w-full"
              :default-value="defaultAccordionValue"
            >
              <UiAccordionItem
                v-if="resolvedId && postStatus !== 'published'"
                value="item-1"
              >
                <UiAccordionTrigger>Schedule</UiAccordionTrigger>
                <UiAccordionContent>
                  <AdminPostSchedule
                    :post-id="resolvedId"
                    :scheduled-at="scheduledAt"
                    @scheduled="scheduledAt = $event"
                    @cancelled="scheduledAt = null"
                  />
                </UiAccordionContent>
              </UiAccordionItem>
              <UiAccordionItem v-if="resolvedId && hasVersions" value="item-2">
                <UiAccordionTrigger
                  class="hover:no-underline! focus:no-underline!"
                  >Version History</UiAccordionTrigger
                >
                <UiAccordionContent>
                  <AdminVersionHistory
                    :post-id="resolvedId"
                    :title="title"
                    :content="content"
                    :excerpt="excerpt"
                    @restored="onRestored"
                  />
                </UiAccordionContent>
              </UiAccordionItem>
            </UiAccordion>
          </div>
        </UiScrollArea>

        <!-- Footer — fixed, never scrolls -->
        <div
          class="px-5 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0"
        >
          <UiButton
            variant="destructive"
            class="w-auto"
            @click="showDeleteConfirm = !showDeleteConfirm"
          >
            <TrashIcon class="w-4 h-4" />
            Delete post
          </UiButton>
        </div>
      </aside>
    </Transition>

    <!-- Delete confirmation dialog -->
    <UiAlertDialog v-model:open="showDeleteConfirm">
      <UiAlertDialogContent>
        <template #overlay>
          <UiAlertDialogOverlay class="bg-black/30 z-40" />
        </template>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Delete this post?</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            This action cannot be undone. The post will be permanently deleted.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel @click="showDeleteConfirm = false" />
          <UiAlertDialogAction
            class="bg-red-600 hover:bg-red-700 text-white"
            @click.prevent="deletePost"
          />
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { Post } from "~/types/blog";
import { toast } from "vue-sonner";
import { TrashIcon, ArrowRightIcon, ClockPlusIcon } from "lucide-vue-next";
import { onClickOutside } from "@vueuse/core";
import { slugify } from "~/utils/slugify";
import { getWordCount } from "~/utils/wordCount";
import { getReadTime } from "~/utils/readTime";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const isNew = id === "new";

// ── Visibility state ──────────────────────────────────────────────────────────
const showGenerateBar = ref(false);
const showMeta = ref(false);
const showDeleteConfirm = ref<boolean>(false);

// ── Generate bar ──────────────────────────────────────────────────────────────
// Only one useTemplateRef per name — a duplicate stays null and breaks onClickOutside.
const generateBarPanelRef = useTemplateRef<HTMLElement>("generateBarPanelRef");
const generateBarComposeRef = useTemplateRef<{ reset: () => void }>(
  "generateBarComposeRef",
);

onClickOutside(generateBarPanelRef, () => {
  showGenerateBar.value = false;
  generateBarComposeRef.value?.reset();
});

// ── Slug validation ───────────────────────────────────────────────────────────
const slugIsValid = ref(true);

// ── Meta panel ────────────────────────────────────────────────────────────────
const metaPanelRef = useTemplateRef("metaPanelRef");

onClickOutside(metaPanelRef, () => {
  if (showDeleteConfirm.value) return;
  showMeta.value = false;
});

// ── Post data ─────────────────────────────────────────────────────────────────
const { data: post } = isNew
  ? { data: ref<Post | null>(null) }
  : await useFetch<Post>(`/api/admin/posts/${id}`);

if (!isNew && !post.value) {
  await router.push("/admin");
}

const title = ref(post.value?.draft_title ?? post.value?.title ?? "");
const content = ref<string>(
  post.value?.draft_content ?? post.value?.content ?? "",
);
const slug = ref(post.value?.slug ?? "");
const excerpt = ref(post.value?.draft_excerpt ?? post.value?.excerpt ?? "");
const coverImage = ref(
  post.value?.draft_cover_image ?? post.value?.cover_image ?? "",
);
const tagsInput = ref("");
const categoriesInput = ref("");
const resolvedId = ref<string | null>(isNew ? null : id);
const postStatus = ref<string>(post.value?.status ?? "draft");
const hasPendingChanges = ref<boolean>(
  post.value?.has_pending_changes ?? false,
);

if (!isNew) {
  const [{ data: existingTags }, { data: existingCategories }] =
    await Promise.all([
      useFetch<{ name: string }[]>(`/api/posts/${id}/tags`),
      useFetch<{ name: string }[]>(`/api/posts/${id}/categories`),
    ]);
  tagsInput.value = existingTags.value?.map((t) => t.name).join(", ") ?? "";
  categoriesInput.value =
    existingCategories.value?.map((c) => c.name).join(", ") ?? "";
}

// ── Snapshot initial aside values to detect changes ───────────────────────────
const savedExcerpt = ref(excerpt.value);
const savedTagsInput = ref(tagsInput.value);
const savedCategoriesInput = ref(categoriesInput.value);

const saving = ref(false);
const publishing = ref(false);
const unpublishing = ref(false);
const editorKey = ref(0);
const lastSaved = ref<Date | null>(
  post.value?.updated_at ? new Date(post.value.updated_at) : null,
);
let saveTimeout: ReturnType<typeof setTimeout>;

// ── Scheduled publish ─────────────────────────────────────────────────────────
const scheduledAt = ref<string | null>(post.value?.publish_at ?? null);

// ── Toast ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (postStatus.value === "published") {
    toast.success(
      "This post is live. Edits are saved as a draft and won't go live until you publish.",
    );
  }
});

// ── Computed ──────────────────────────────────────────────────────────────────
const hasUserContent = computed(() => {
  console.log("***", title.value);
  if (title.value.trim()) return true;

  try {
    const parsed = JSON.parse(content.value);
    return parsed.blocks?.some((b: any) => b.data?.text?.trim());
  } catch {
    return !!content.value.trim();
  }
});

const wordCount = computed(() => getWordCount(content.value));
const readTime = computed(() => getReadTime(wordCount.value));

const timeAgo = computed(() => {
  if (!lastSaved.value) return "";
  const diff = Math.floor((Date.now() - lastSaved.value.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
});

// ── Generate ──────────────────────────────────────────────────────────────────
const onGenerated = (result: {
  title: string;
  excerpt: string;
  blocks: any[];
}) => {
  title.value = result.title;
  excerpt.value = result.excerpt;
  content.value = JSON.stringify({ blocks: result.blocks });
  showGenerateBar.value = false;
  editorKey.value++;
  autoSave();
};

const onGenerateError = (message: string) => {
  console.error(message);
};

// ── Restore ───────────────────────────────────────────────────────────────────
const onRestored = (result: {
  title: string;
  content: string;
  excerpt: string;
}) => {
  title.value = result.title;
  content.value = result.content;
  excerpt.value = result.excerpt;
  hasPendingChanges.value = true;
  editorKey.value++;
};

// ── Save ──────────────────────────────────────────────────────────────────────
const save = async () => {
  const hasContent = title.value.trim() || content.value;
  if (isNew && !hasContent) return;

  saving.value = true;

  if (!resolvedId.value) {
    const created = await $fetch<Post>("/api/posts", {
      method: "POST",
      credentials: "include",
      body: {
        title: title.value,
        slug: null,
        content: content.value,
        excerpt: excerpt.value,
        cover_image: coverImage.value || null,
        status: "draft",
        published_at: null,
      },
    });
    resolvedId.value = created.id;
    await router.replace(`/admin/posts/${created.id}`);
  } else {
    await $fetch(`/api/posts/${resolvedId.value}`, {
      method: "PUT",
      credentials: "include",
      body: {
        title: title.value,
        content: content.value,
        slug: slug.value,
        excerpt: excerpt.value,
        cover_image: coverImage.value,
      },
    });
  }

  lastSaved.value = new Date();
  if (postStatus.value === "published") {
    hasPendingChanges.value = true;
    toast.success("You have unpublished changes. The live post is unchanged.");
  }
  saving.value = false;
};

/** Only saves if the given field has changed from its last saved value. */
const saveIfChanged = (field: "excerpt") => {
  if (field === "excerpt" && excerpt.value === savedExcerpt.value) return;
  savedExcerpt.value = excerpt.value;
  save();
};

const autoSave = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(save, 1500);
};

const saveMeta = async () => {
  if (!resolvedId.value) return;
  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const categories = categoriesInput.value
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  await $fetch(`/api/admin/posts/${resolvedId.value}/meta`, {
    method: "PUT",
    credentials: "include",
    body: { tags, categories },
  });
  // Update snapshots after save
  savedTagsInput.value = tagsInput.value;
  savedCategoriesInput.value = categoriesInput.value;
  if (postStatus.value === "published") {
    hasPendingChanges.value = true;
    toast.success("You have unpublished changes. The live post is unchanged.");
  }
};

/** Only saves meta if tags or categories have changed from their last saved values. */
const saveMetaIfChanged = () => {
  if (
    tagsInput.value === savedTagsInput.value &&
    categoriesInput.value === savedCategoriesInput.value
  )
    return;
  saveMeta();
};

// ── Publish / Unpublish / Delete ──────────────────────────────────────────────
const publish = async (republish = false) => {
  publishing.value = true;
  try {
    const generatedSlug = slug.value || slugify(title.value);

    if (!resolvedId.value) {
      const created = await $fetch<Post>("/api/posts", {
        method: "POST",
        credentials: "include",
        body: {
          title: title.value,
          slug: generatedSlug,
          content: content.value,
          excerpt: excerpt.value,
          cover_image: coverImage.value || null,
          status: "published",
          published_at: new Date().toISOString(),
        },
      });
      resolvedId.value = created.id;
      await router.replace(`/admin/posts/${created.id}`);
    } else {
      await $fetch(`/api/posts/${resolvedId.value}` as "/api/posts/:id", {
        method: "PUT",
        credentials: "include",
        body: {
          title: title.value,
          content: content.value,
          slug: generatedSlug,
          excerpt: excerpt.value,
          cover_image: coverImage.value || null,
          status: "published",
        },
      });
    }

    await $fetch(`/api/admin/posts/${resolvedId.value}/meta/apply`, {
      method: "POST",
      credentials: "include",
    });

    await $fetch(`/api/posts/${resolvedId.value}/versions`, {
      method: "POST",
      body: {
        title: title.value,
        content: content.value,
        excerpt: excerpt.value,
        label: `Published ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      },
    });

    slug.value = generatedSlug;
    postStatus.value = "published";
    hasPendingChanges.value = false;

    toast.success(
      republish
        ? "Updated content republished successfully"
        : "Post published successfully",
    );
  } finally {
    publishing.value = false;
  }
};

// ── Version history ───────────────────────────────────────────────────────────
const { data: versions } = isNew
  ? { data: ref([]) }
  : await useFetch(`/api/posts/${id}/versions`);

const hasVersions = computed(() => (versions.value?.length ?? 0) > 0);

const defaultAccordionValue = computed(() => {
  if (resolvedId.value && postStatus.value !== "published") return "item-1";
  if (resolvedId.value && hasVersions.value) return "item-2";
  return undefined;
});

const unpublish = async () => {
  if (!resolvedId.value) return;
  unpublishing.value = true;
  try {
    await $fetch(`/api/posts/${resolvedId.value}` as "/api/posts/:id", {
      method: "PUT",
      credentials: "include",
      body: { status: "draft", published_at: null },
    });
    postStatus.value = "draft";
    toast.success("Post successfully unpublished and is in draft mode");
  } finally {
    unpublishing.value = false;
  }
};

const deletePost = async () => {
  if (resolvedId.value) {
    await $fetch(`/api/posts/${resolvedId.value}` as "/api/posts/:id", {
      method: "DELETE",
      credentials: "include",
    });
  }
  showDeleteConfirm.value = false;
  await router.push("/admin");
};
</script>
