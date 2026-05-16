<template>
  <div class="space-y-2">
    <label class="text-xs text-gray-500">Cover image</label>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden"
      @change="onFileChange"
    />

    <!-- Preview -->
    <div
      v-if="modelValue"
      class="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <img
        :src="modelValue"
        alt="Cover image preview"
        class="w-full h-32 object-cover"
      />
      <div
        class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/30"
      >
        <UiButton size="sm" variant="secondary" @click="triggerUpload">
          <Icon name="lucide:image" class="w-3.5 h-3.5" />
          Replace
        </UiButton>
        <UiButton size="sm" variant="destructive" @click="removeImage">
          <XIcon class="w-3.5 h-3.5" />
          Remove
        </UiButton>
      </div>
    </div>

    <!-- Upload button — shown when no image -->
    <button
      v-else
      :disabled="uploading"
      class="w-full flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-gray-100 border-gray-300 dark:border-gray-700 py-8 text-gray-600 hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      @click="triggerUpload"
    >
      <LoaderCircleIcon v-if="uploading" class="w-5 h-5 animate-spin" />
      <div
        v-else
        class="rounded-full bg-purple-100 hover:text-white dark:bg-gray-700 p-2 size-10 flex items-center justify-center shadow-lg transition-[color,box-shadow] border-white cursor-pointer"
      >
        <CloudUploadIcon class="w-5 h-5 text-purple-800 dark:text-gray-400" />
      </div>
      <span class="text-xs">{{
        uploading ? "Uploading…" : "Click to upload cover image"
      }}</span>
      <span class="text-[10px] text-gray-400"
        >JPEG, PNG, WebP or GIF · Max 5MB</span
      >
    </button>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { XIcon, LoaderCircleIcon, CloudUploadIcon } from "lucide-vue-next";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const uploading = ref(false);
const error = ref("");
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerUpload = () => {
  fileInputRef.value?.click();
};

const removeImage = () => {
  emit("update:modelValue", "");
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const onFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  error.value = "";
  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const result = await $fetch<{ url: string }>("/api/uploads/image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    emit("update:modelValue", result.url);
  } catch (e: any) {
    error.value = e?.data?.message ?? "Upload failed. Please try again.";
  } finally {
    uploading.value = false;
  }
};
</script>
