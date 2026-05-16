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

  const adminClient = serverSupabaseServiceRole<Database>(event);

  const [{ count: all }, { count: published }, { count: draft }] =
    await Promise.all([
      adminClient
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .or("status.eq.published,title.neq.,title.not.is.null"),
      adminClient
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "published"),
      adminClient
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "draft")
        .or("title.neq.,title.not.is.null"),
    ]);

  return {
    all: all ?? 0,
    published: published ?? 0,
    draft: draft ?? 0,
  };
});
