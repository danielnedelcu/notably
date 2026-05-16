<script setup lang="ts">
const client = useSupabaseClient();
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

const login = async () => {
  loading.value = true;
  error.value = null;

  const { error: sbError } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  loading.value = false;

  if (sbError) {
    error.value = sbError.message;
    return;
  }

  await navigateTo("/seed");
};
</script>

<template>
  <div class="max-w-sm mx-auto mt-20 p-8 space-y-4">
    <h1 class="text-2xl font-bold">Login</h1>

    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="w-full border px-3 py-2 rounded"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="w-full border px-3 py-2 rounded"
    />

    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <button
      class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      :disabled="loading"
      @click="login"
    >
      {{ loading ? "Logging in..." : "Login" }}
    </button>
  </div>
</template>
