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

  const query = getQuery(event);
  const slug = query.slug as string;
  const excludeId = query.excludeId as string | undefined;

  if (!slug)
    throw createError({ statusCode: 400, message: "slug is required" });

  const adminClient = serverSupabaseServiceRole<Database>(event);

  let request = adminClient.from("posts").select("id").eq("slug", slug);

  if (excludeId) {
    request = request.neq("id", excludeId);
  }

  const { data } = await request.maybeSingle();

  return { available: !data };
});
