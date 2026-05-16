<template>
  <header
    class="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 shrink-0"
  >
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/admin"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </NuxtLink>

      <div class="text-xs text-gray-400 tabular-nums flex items-center gap-1">
        <template v-if="saving">
          <span class="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Saving…
        </template>
        <template v-else-if="lastSaved">
          <Icon name="lucide:check" class="w-3 h-3" />
          Saved {{ timeAgo }}
        </template>
      </div>
    </div>

    <div
      v-if="scheduledAt && postStatus !== 'published'"
      class="flex items-center gap-2"
    >
      <div
        class="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400"
      >
        <Icon name="lucide:calendar-clock" class="w-3.5 h-3.5" />
        Scheduled for {{ formatScheduled(scheduledAt) }}
      </div>
    </div>

    <div class="flex items-center gap-2">
      <UiButton variant="outline" @click="emit('toggle-meta')">
        <Icon name="lucide:logs" class="w-4 h-4" />
        Post settings
      </UiButton>

      <UiButton
        v-if="postStatus === 'published'"
        :disabled="unpublishing"
        :loading="unpublishing"
        @click="emit('unpublish')"
      >
        <Icon v-if="!unpublishing" name="lucide:globe-off" class="w-4 h-4" />
        {{ unpublishing ? "Unpublishing…" : "Unpublish" }}
      </UiButton>
      <UiButton
        v-if="postStatus !== 'published'"
        :class="resolvedId ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'"
        :disabled="!resolvedId || publishing || !slugIsValid"
        :loading="publishing"
        @click="emit('publish', false)"
      >
        <Icon name="lucide:globe" class="w-4 h-4" />
        {{ publishing ? "Publishing…" : "Publish" }}
      </UiButton>
      <UiButton
        v-if="postStatus === 'published' && hasPendingChanges"
        class="bg-red-900"
        :disabled="publishing"
        :loading="publishing"
        icon="svg-spinners:270-ring-with-bg"
        @click="emit('publish', true)"
      >
        {{ publishing ? "Publishing…" : "Publish changes" }}
      </UiButton>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  saving: boolean;
  lastSaved: Date | null;
  timeAgo: string;
  postStatus: string;
  resolvedId: string | null;
  publishing: boolean;
  unpublishing: boolean;
  hasPendingChanges: boolean;
  scheduledAt: string | null;
  slugIsValid: boolean;
}>();

const emit = defineEmits<{
  "toggle-meta": [];
  publish: [republish: boolean];
  unpublish: [];
}>();

const formatScheduled = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
</script>
