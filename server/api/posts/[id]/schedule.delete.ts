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
    .from("posts")
    .update({ publish_at: null })
    .eq("id", id as string)
    .select()
    .single();

  if (error) throw createError({ statusCode: 500, message: error.message });

  return data;
});
