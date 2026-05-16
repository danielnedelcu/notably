import type { Database } from "~/types/database.types";

const SAMPLE_TITLES = [
  "Getting Started with Nuxt 4",
  "Why I Switched to Supabase",
  "Building a Blog with Vue and Tailwind",
  "The Joy of TypeScript in 2025",
  "My Thoughts on Modern Web Development",
];

const SAMPLE_CONTENT = `
## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Main Section

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

- Point one about the topic
- Point two that expands on things
- Point three wrapping it up

## Code Example

\`\`\`ts
const hello = (name: string) => {
  console.log(\`Hello, \${name}!\`)
}
\`\`\`

## Conclusion

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
`.trim();

const SAMPLE_EXCERPTS = [
  "A deep dive into what makes this technology so compelling for modern developers.",
  "My personal experience after six months of using this in production.",
  "Everything I wish I knew before starting this journey.",
  "A practical guide with real world examples and lessons learned.",
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now()
  );
}

export const useSeedPost = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const generatePost = async (status: "draft" | "published" = "published") => {
    if (!user.value) {
      error.value = "You must be logged in to create a post";
      return null;
    }

    loading.value = true;
    error.value = null;

    const title = randomFrom(SAMPLE_TITLES);

    const post = {
      user_id: user.value?.id ?? user.value?.sub,
      title,
      slug: slugify(title),
      excerpt: randomFrom(SAMPLE_EXCERPTS),
      content: SAMPLE_CONTENT,
      cover_image: randomFrom(SAMPLE_IMAGES),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { data, error: sbError } = await client
      .from("posts")
      .insert(post)
      .select()
      .single();

    loading.value = false;

    if (sbError) {
      error.value = sbError.message;
      return null;
    }

    return data;
  };

  return { generatePost, loading, error };
};
