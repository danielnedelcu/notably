<template>
  <div class="fixed bottom-6 right-6 z-50 w-11 h-11">
    <svg
      class="scroll-progress-ring -rotate-90 w-full h-full"
      viewBox="0 0 44 44"
    >
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        class="text-gray-200 dark:text-gray-500"
      />
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="progress-circle text-red-500"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
const circumference = Math.round(2 * Math.PI * 18);
</script>

<style scoped>
.progress-circle {
  animation: scroll-progress linear forwards;
  animation-timeline: scroll();
}

@keyframes scroll-progress {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
