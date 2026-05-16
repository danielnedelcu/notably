<template>
  <div class="space-y-2">
    <div v-if="loading" class="text-xs text-gray-400">Loading…</div>

    <div v-else-if="versions.length" class="space-y-1">
      <UiScrollArea
        class="w-full rounded-md border"
        :class="{ 'h-64': versions.length > 3 }"
      >
        <UiItem v-for="v in versions" :key="v.id" variant="muted" class="mb-1">
          <UiItemContent>
            <UiItemTitle class="text-xs">{{ v.label }}</UiItemTitle>
            <UiItemDescription class="text-xs">
              <span class="text-gray-400">{{ formatDate(v.created_at) }}</span>
            </UiItemDescription>
          </UiItemContent>
          <UiItemActions>
            <UiButton variant="outline" size="sm" @click="restore(v.id)">
              <Icon name="lucide:undo-2" class="w-4 h-4" />
              {{ restoring === v.id ? "Restoring…" : "Restore" }}
            </UiButton>
          </UiItemActions>
        </UiItem>
      </UiScrollArea>
    </div>

    <p v-else class="text-xs text-gray-400">No versions saved yet.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  postId: string;
  title: string;
  content: string;
  excerpt: string;
}>();

const emit = defineEmits<{
  restored: [result: { title: string; content: string; excerpt: string }];
}>();

const versions = ref<any[]>([]);
const loading = ref(false);
const restoring = ref<string | null>(null);

const fetchVersions = async () => {
  loading.value = true;
  try {
    versions.value = await $fetch(`/api/posts/${props.postId}/versions`);
  } finally {
    loading.value = false;
  }
};

const restore = async (versionId: string) => {
  restoring.value = versionId;
  try {
    const result = await $fetch<{
      draft_title: string;
      draft_content: string;
      draft_excerpt: string;
    }>(`/api/posts/${props.postId}/versions/${versionId}/restore`, {
      method: "POST",
    });
    console.log("result", result);
    emit("restored", {
      title: result.draft_title,
      content: result.draft_content,
      excerpt: result.draft_excerpt,
    });
    await fetchVersions();
  } finally {
    restoring.value = null;
  }
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

onMounted(fetchVersions);
</script>
