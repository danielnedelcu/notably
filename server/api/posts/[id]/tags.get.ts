import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, "id");
  const client = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await client
    .from("post_tags")
    .select("tags(id, name, slug)")
    .eq("post_id", postId as string);

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data?.map((d) => d.tags).flat() ?? [];
});
