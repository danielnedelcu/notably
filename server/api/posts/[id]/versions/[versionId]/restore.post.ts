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

  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

  const id = getRouterParam(event, "id");
  const versionId = getRouterParam(event, "versionId");
  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Fetch the version content
  const { data: version, error: versionError } = await adminClient
    .from("post_versions")
    .select("title, content, excerpt")
    .eq("id", versionId as string)
    .eq("post_id", id as string) // ensures the version belongs to this post
    .single();

  if (versionError || !version) {
    throw createError({ statusCode: 404, message: "Version not found" });
  }

  // Apply the version content to the post as a draft
  const { data, error } = await adminClient
    .from("posts")
    .update({
      draft_title: version.title,
      draft_content: version.content,
      draft_excerpt: version.excerpt,
      has_pending_changes: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id as string)
    .select()
    .single();

  if (error) throw createError({ statusCode: 500, message: error.message });

  return data;
});
