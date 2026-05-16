import {
  serverSupabaseServiceRole,
  serverSupabaseClient,
} from "#supabase/server";
import type { Database } from "~/types/database.types";
import { applyTagsAndCategories } from "../meta.put";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

  const postId = getRouterParam(event, "id");
  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Fetch the draft tags/categories stored on the post
  const { data: post } = await adminClient
    .from("posts")
    .select("draft_tags, draft_categories")
    .eq("id", postId as string)
    .single();

  if (!post) throw createError({ statusCode: 404, message: "Post not found" });

  // Apply draft meta to junction tables if they exist
  if (post.draft_tags || post.draft_categories) {
    await applyTagsAndCategories(adminClient, postId as string, {
      tags: post.draft_tags ? (post.draft_tags as string[]) : undefined,
      categories: post.draft_categories
        ? (post.draft_categories as string[])
        : undefined,
    });

    // Clear draft meta now that it's been applied
    await adminClient
      .from("posts")
      .update({ draft_tags: null, draft_categories: null })
      .eq("id", postId as string);
  }

  return { success: true };
});
