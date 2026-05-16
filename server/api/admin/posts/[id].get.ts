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
  const adminClient = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await adminClient
    .from("posts")
    .select("*")
    .eq("id", id as string)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Post not found" });
  }

  return data;
});
