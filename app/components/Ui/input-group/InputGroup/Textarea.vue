<template>
  <UiTextarea
    v-bind="forwarded"
    data-slot="input-group-textarea"
    :model-value="props.modelValue ?? ''"
    :class="
      inputGroupTextareaStyles({
        class: normalizeClass(props.class) || undefined,
      })
    "
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </UiTextarea>
</template>

<script lang="ts">
import { normalizeClass } from "vue";

import type { TextareaProps } from "@/components/Ui/textarea/Textarea.vue";

const inputGroupTextareaStyles = tv({
  base: "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
});
</script>

<script lang="ts" setup>
const props = defineProps<TextareaProps>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

/** Omit values we bind explicitly so v-model always reaches the parent (needed inside ClientOnly / nested groups). */
const forwarded = reactiveOmit(props, ["class", "modelValue"]);
</script>
