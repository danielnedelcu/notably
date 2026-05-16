import {
  serverSupabaseServiceRole,
  serverSupabaseClient,
} from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  console.log("Cookies received:", Object.keys(cookies));

  const client = await serverSupabaseClient<Database>(event);
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  console.log("POST /api/posts - user:", user?.id ?? "null");
  console.log("POST /api/posts - authError:", authError?.message ?? "none");

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  console.log("POST /api/posts - body:", body);

  const adminClient = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await adminClient
    .from("posts")
    .insert({
      user_id: user.id,
      title: body.title,
      slug: body.slug || null,
      excerpt: body.excerpt ?? null,
      content: body.content ?? "",
      cover_image: body.cover_image ?? null,
      status: body.status ?? "draft",
      published_at:
        body.status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  //   console.log("POST /api/posts - result:", { data, error });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
