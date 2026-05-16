<template>
  <footer
    class="flex h-8 items-center justify-end border-t border-gray-200 dark:border-gray-800 px-4 shrink-0"
  >
    <p class="text-[10px] uppercase tracking-widest text-gray-400 tabular-nums">
      {{ wordCount.toLocaleString() }} words · {{ readTime }} min read
    </p>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  wordCount: number;
  readTime: number;
}>();
</script>
