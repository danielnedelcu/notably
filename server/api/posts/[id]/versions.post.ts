import {
  serverSupabaseServiceRole,
  serverSupabaseClient,
} from "#supabase/server";
import type { Database } from "~/types/database.types";

const MAX_VERSIONS = 5;

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

  const id = getRouterParam(event, "id");
  const { title, content, excerpt, label } = await readBody(event);

  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Get the current max version number for this post
  const { data: latest } = await adminClient
    .from("post_versions")
    .select("version_number")
    .eq("post_id", id as string)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latest?.version_number ?? 0) + 1;

  const { data, error } = await adminClient
    .from("post_versions")
    .insert({
      post_id: id,
      title,
      content,
      excerpt,
      label: label ?? "Manual save",
      version_number: nextVersion,
    })
    .select()
    .single();

  if (error) throw createError({ statusCode: 500, message: error.message });

  const { count } = await adminClient
    .from("post_versions")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id as string);

  if (count && count > MAX_VERSIONS) {
    const { data: oldest } = await adminClient
      .from("post_versions")
      .select("id")
      .eq("post_id", id as string)
      .order("version_number", { ascending: true })
      .limit(1)
      .single();

    if (oldest) {
      await adminClient.from("post_versions").delete().eq("id", oldest.id);
    }
  }
  return data;
});
