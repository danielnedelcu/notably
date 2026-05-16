<script setup lang="ts">
const { generatePost, loading, error } = useSeedPost();
const lastPost = ref();

const user = useSupabaseUser();
console.log("Current user:", user.value);

const create = async (status: "draft" | "published") => {
  const post = await generatePost(status);
  if (post) lastPost.value = post;
};
</script>

<template>
  <div class="max-w-lg mx-auto mt-20 p-8 space-y-6">
    <h1 class="text-2xl font-bold">Seed a Test Post</h1>

    <div class="flex gap-4">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        :disabled="loading"
        @click="create('published')"
      >
        {{ loading ? "Creating..." : "Create Published Post" }}
      </button>
      <button
        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        :disabled="loading"
        @click="create('draft')"
      >
        {{ loading ? "Creating..." : "Create Draft Post" }}
      </button>
    </div>

    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-if="lastPost" class="p-4 bg-gray-100 rounded text-sm space-y-1">
      <p><span class="font-semibold">Title:</span> {{ lastPost.title }}</p>
      <p><span class="font-semibold">Slug:</span> {{ lastPost.slug }}</p>
      <p><span class="font-semibold">Status:</span> {{ lastPost.status }}</p>
      <p><span class="font-semibold">ID:</span> {{ lastPost.id }}</p>
    </div>
  </div>
</template>
