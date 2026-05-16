import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "id");
  const client = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug as string)
    .eq("status", "published")
    .single();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Post not found" });
  }

  return data;
});
