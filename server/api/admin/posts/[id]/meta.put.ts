import {
  serverSupabaseServiceRole,
  serverSupabaseClient,
} from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const postId = getRouterParam(event, "id");
  const body = await readBody(event);
  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Fetch current post to check status
  const { data: post } = await adminClient
    .from("posts")
    .select("status")
    .eq("id", postId as string)
    .single();

  if (post?.status === "published") {
    // Store as draft pending changes — don't touch junction tables yet
    const update: Record<string, any> = { has_pending_changes: true };
    if (body.tags !== undefined) update.draft_tags = body.tags;
    if (body.categories !== undefined)
      update.draft_categories = body.categories;

    await adminClient
      .from("posts")
      .update(update)
      .eq("id", postId as string);
  } else {
    // Draft post — apply directly to junction tables
    await applyTagsAndCategories(adminClient, postId as string, body);
  }

  return { success: true };
});

async function applyTagsAndCategories(
  adminClient: any,
  postId: string,
  body: { tags?: string[]; categories?: string[] },
) {
  if (body.tags !== undefined) {
    const tagSlugs = body.tags.map((t: string) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    );
    const tagInserts = body.tags.map((name: string, i: number) => ({
      name,
      slug: tagSlugs[i],
    }));
    const { data: tags } = await adminClient
      .from("tags")
      .upsert(tagInserts, { onConflict: "slug" })
      .select("id, slug");

    await adminClient.from("post_tags").delete().eq("post_id", postId);
    if (tags?.length) {
      await adminClient
        .from("post_tags")
        .insert(tags.map((tag: any) => ({ post_id: postId, tag_id: tag.id })));
    }
  }

  if (body.categories !== undefined) {
    const catSlugs = body.categories.map((c: string) =>
      c
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    );
    const catInserts = body.categories.map((name: string, i: number) => ({
      name,
      slug: catSlugs[i],
    }));
    const { data: cats } = await adminClient
      .from("categories")
      .upsert(catInserts, { onConflict: "slug" })
      .select("id, slug");

    await adminClient.from("post_categories").delete().eq("post_id", postId);
    if (cats?.length) {
      await adminClient
        .from("post_categories")
        .insert(
          cats.map((cat: any) => ({ post_id: postId, category_id: cat.id })),
        );
    }
  }
}

export { applyTagsAndCategories };
