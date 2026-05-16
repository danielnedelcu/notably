<template>
    <div class="mx-auto max-w-6xl px-4 py-12">
        <h1 class="mb-2">Blog page for real estate</h1>
        <!-- <p class="mb-10">Thoughts, ideas and things I've learned.</p> -->
        <div v-if="posts?.length" class="h-full my-18">
            <article v-for="post in posts" :key="post.id" class="group">
                <NuxtLink :to="`/posts/${post.slug}`">
                    <article
                        class="relative flex flex-col justify-end rounded-lg overflow-hidden min-h-[200px]"
                        :class="
                            post.cover_image ? 'h-[600px]' : 'h-auto bg-white'
                        "
                    >
                        <img
                            v-if="post.cover_image"
                            :src="post.cover_image"
                            :alt="post.title"
                            class="absolute inset-0 w-full h-full object-cover"
                        />
                        <div
                            v-if="post.cover_image"
                            class="absolute inset-0 bg-linear-to-b from-transparent via-[oklch(0%_0.034_264.665/0.4)] to-[oklch(2%_0.034_264.665)]"
                        />
                        <div class="relative flex flex-col justify-end p-8">
                            <h2
                                :class="
                                    post.cover_image
                                        ? 'text-white'
                                        : 'text-[#2b2b2b]'
                                "
                            >
                                {{ post.title }}
                            </h2>
                            <p
                                v-if="post.excerpt"
                                :class="
                                    post.cover_image
                                        ? 'text-white mt-2'
                                        : 'text-[#2b2b2b] mt-2'
                                "
                            >
                                {{ post.excerpt }}
                            </p>
                            <p
                                class="text-sm mt-2"
                                :class="
                                    post.cover_image
                                        ? 'text-white/70'
                                        : 'text-[#2b2b2b]/60'
                                "
                            >
                                {{
                                    new Date(
                                        post.published_at,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                }}
                            </p>
                        </div>
                    </article>
                </NuxtLink>
            </article>
        </div>

        <p v-else class="text-gray-500">No posts yet.</p>
    </div>
</template>

<script setup lang="ts">
import type { Post } from "~/types/blog";

const { data: posts } = await useFetch<Post[]>("/api/posts");
</script>
