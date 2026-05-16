import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await client
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      cover_image,
      published_at,
      post_categories(categories(id, name, slug)),
      post_tags(tags(id, name, slug)),
      post_likes(count)
    `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  // Flatten the nested relations
  return data?.map((post) => ({
    ...post,
    categories:
      post.post_categories?.map((pc: any) => pc.categories).flat() ?? [],
    tags: post.post_tags?.map((pt: any) => pt.tags).flat() ?? [],
    likes: post.post_likes?.[0]?.count ?? 0,
    post_categories: undefined,
    post_tags: undefined,
    post_likes: undefined,
  }));
});
