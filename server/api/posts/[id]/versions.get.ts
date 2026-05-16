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
  const adminClient = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await adminClient
    .from("post_versions")
    .select("id, version_number, label, title, created_at")
    .eq("post_id", id as string)
    .order("version_number", { ascending: false })
    .limit(20); // keep the last 20 versions

  if (error) throw createError({ statusCode: 500, message: error.message });

  return data;
});
