<template>
  <div>
    <NuxtLoadingIndicator color="oklch(58.6% 0.253 17.585)" />
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toaster rich-colors position="top-center" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import Toaster from "@/components/Ui/sonner/Sonner.vue";
</script>
