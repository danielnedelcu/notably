<template>
  <UiTooltipProvider v-bind="{ delayDuration: props.delayDuration }">
    <TooltipRoot v-bind="forwarded">
      <slot />
    </TooltipRoot>
  </UiTooltipProvider>
</template>

<script lang="ts" setup>
  import { TooltipRoot, useForwardPropsEmits } from "reka-ui";
  import type { TooltipProviderProps, TooltipRootEmits, TooltipRootProps } from "reka-ui";

  defineOptions({ inheritAttrs: false });

  const props = withDefaults(defineProps<TooltipRootProps & TooltipProviderProps>(), {
    delayDuration: 0,
  });

  const emits = defineEmits<TooltipRootEmits>();
  const forwarded = useForwardPropsEmits(props, emits);
</script>
