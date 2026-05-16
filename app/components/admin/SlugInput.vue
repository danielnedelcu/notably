<template>
  <div class="space-y-1.5">
    <div class="flex flex-col space-y-1.5 m-0 gap-1">
      <div class="flex flex-row items-center justify-between">
        <label class="text-xs text-gray-500">Slug</label>
        <p v-if="localSlug && !isValid" class="text-xs text-red-500">
          Only lowercase letters, numbers and hyphens allowed
        </p>
        <p
          v-else-if="localSlug && isValid && !isAvailable && !checking"
          class="text-xs text-red-500"
        >
          This slug is already taken
        </p>
        <p
          v-else-if="localSlug && isValid && isAvailable && !checking"
          class="text-xs text-green-700"
        >
          Slug is available
        </p>
      </div>
      <div class="relative">
        <input
          v-model="localSlug"
          type="text"
          placeholder="post-slug"
          class="w-full rounded-md border px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-colors pr-7"
          :class="inputClass"
          @input="onInput"
          @blur="onBlur"
        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2">
          <LoaderCircleIcon
            v-if="checking"
            class="w-3.5 h-3.5 text-gray-400 animate-spin"
          />
          <CheckIcon
            v-else-if="isValid && isAvailable"
            class="w-3.5 h-3.5 text-green-500"
          />
          <XIcon
            v-else-if="localSlug && !isValid"
            class="w-3.5 h-3.5 text-red-500"
          />
          <XIcon
            v-else-if="localSlug && isValid && !isAvailable"
            class="w-3.5 h-3.5 text-red-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, XIcon, LoaderCircleIcon } from "lucide-vue-next";
import { useDebounceFn } from "@vueuse/core";

const props = defineProps<{
  modelValue: string;
  postId: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  valid: [isValid: boolean];
}>();

const localSlug = ref(props.modelValue);
const checking = ref(false);
const isAvailable = ref(true);
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isValid = computed(
  () => !localSlug.value || slugRegex.test(localSlug.value),
);

const inputClass = computed(() => {
  return "border-gray-200 dark:border-gray-700 focus:ring-gray-300 dark:focus:ring-gray-600";
});

const checkAvailability = useDebounceFn(async (slug: string) => {
  if (!slug || !isValid.value) return;
  checking.value = true;
  try {
    const result = await $fetch<{ available: boolean }>(
      "/api/posts/check-slug",
      {
        query: {
          slug,
          ...(props.postId ? { excludeId: props.postId } : {}),
        },
      },
    );
    isAvailable.value = result.available;
  } finally {
    checking.value = false;
  }
  emit("valid", isValid.value && isAvailable.value);
}, 500);

const onInput = () => {
  // Auto-format: lowercase, replace spaces with hyphens, strip invalid chars
  localSlug.value = localSlug.value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  emit("update:modelValue", localSlug.value);
  isAvailable.value = true; // reset until check completes
  checkAvailability(localSlug.value);
};

const onBlur = () => {
  emit("update:modelValue", localSlug.value);
};

watch(
  () => props.modelValue,
  (val) => {
    if (val !== localSlug.value) localSlug.value = val;
  },
);
</script>
