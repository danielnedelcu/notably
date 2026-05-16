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

  const { error } = await adminClient
    .from("posts")
    .delete()
    .eq("id", id as string)
    .eq("user_id", user.id); // extra safety check

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true };
});
