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
  const { publish_at } = await readBody(event);

  if (!publish_at) {
    throw createError({ statusCode: 400, message: "publish_at is required" });
  }

  // Validate it's a future date
  if (new Date(publish_at) <= new Date()) {
    throw createError({
      statusCode: 400,
      message: "Scheduled date must be in the future",
    });
  }

  const adminClient = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await adminClient
    .from("posts")
    .update({ publish_at, status: "draft" })
    .eq("id", id as string)
    .select()
    .single();

  if (error) throw createError({ statusCode: 500, message: error.message });

  return data;
});
