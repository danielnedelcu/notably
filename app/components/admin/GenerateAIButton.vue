<template>
  <!-- Backdrop -->
  <FadeTransition>
    <div
      v-if="showGenerateBar"
      class="fixed inset-0 bg-gray-100/80 dark:bg-gray-900/50 z-10 pointer-events-none"
    />
  </FadeTransition>

  <!-- Button -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="!hasUserContent && !showGenerateBar"
      class="fixed bottom-10 left-1/2 -translate-x-1/2 z-10"
    >
      <UiButton
        variant="outline"
        size="sm"
        class="shadow-lg rounded-full px-5"
        @click="emit('click')"
      >
        <SparklesIcon class="w-4 h-4" />
        Generate with AI
      </UiButton>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { SparklesIcon } from "lucide-vue-next";

defineProps<{
  hasUserContent: boolean;
  showGenerateBar: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>
