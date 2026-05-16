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

  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Fetch current post to check status
  const { data: currentPost } = await adminClient
    .from("posts")
    .select(
      "status, has_pending_changes, draft_title, draft_content, draft_excerpt, draft_cover_image, title, content, excerpt, cover_image",
    )
    .eq("id", id as string)
    .single();

  const isPublished = currentPost?.status === "published";

  console.log("PUT - isPublished:", isPublished);
  console.log("PUT - body.status:", body.status);
  console.log(
    "PUT - updates going to:",
    isPublished && !body.status ? "DRAFT FIELDS" : "LIVE FIELDS",
  );

  // If publishing — promote draft fields to live
  if (body.status === "published") {
    const updates: Record<string, unknown> = {
      status: "published",
      published_at: new Date().toISOString(),
      has_pending_changes: false,
      draft_title: null,
      draft_content: null,
      draft_excerpt: null,
      draft_cover_image: null,
    };

    if (currentPost?.has_pending_changes) {
      if (currentPost.draft_title !== null)
        updates.title = currentPost.draft_title;
      if (currentPost.draft_content !== null)
        updates.content = currentPost.draft_content;
      if (currentPost.draft_excerpt !== null)
        updates.excerpt = currentPost.draft_excerpt;
      if (currentPost.draft_cover_image !== null)
        updates.cover_image = currentPost.draft_cover_image;
    }

    if (body.slug) updates.slug = body.slug;

    const { data, error } = await adminClient
      .from("posts")
      .update(updates)
      .eq("id", id as string)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw createError({ statusCode: 500, message: error.message });
    return data;
  }

  // If unpublishing
  if (body.status === "draft") {
    const { data, error } = await adminClient
      .from("posts")
      .update({ status: "draft", published_at: null })
      .eq("id", id as string)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw createError({ statusCode: 500, message: error.message });
    return data;
  }

  // If post is published — save to draft fields only
  if (isPublished) {
    const updates: Record<string, unknown> = { has_pending_changes: true };
    if (body.title !== undefined) updates.draft_title = body.title;
    if (body.content !== undefined) updates.draft_content = body.content;
    if (body.excerpt !== undefined) updates.draft_excerpt = body.excerpt;
    if (body.cover_image !== undefined)
      updates.draft_cover_image = body.cover_image;
    if (body.slug !== undefined) updates.slug = body.slug || null;

    const { data, error } = await adminClient
      .from("posts")
      .update(updates)
      .eq("id", id as string)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw createError({ statusCode: 500, message: error.message });
    return data;
  }

  // Post is a draft — save directly to live fields
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
  if (body.cover_image !== undefined) updates.cover_image = body.cover_image;
  if (body.slug !== undefined) updates.slug = body.slug || null;

  const { data, error } = await adminClient
    .from("posts")
    .update(updates)
    .eq("id", id as string)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw createError({ statusCode: 500, message: error.message });
  return data;
});
