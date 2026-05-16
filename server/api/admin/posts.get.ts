import {
  serverSupabaseServiceRole,
  serverSupabaseClient,
} from "#supabase/server";
import type { Database } from "~/types/database.types";

const PAGE_SIZE = 5;

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const query = getQuery(event);
  const page = Math.max(1, parseInt((query.page as string) ?? "1"));
  const status = (query.status as string) ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const adminClient = serverSupabaseServiceRole<Database>(event);

  let request = adminClient
    .from("posts")
    .select("id, title, slug, status, published_at, created_at, updated_at", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .or("status.eq.published,title.neq.,title.not.is.null")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (status !== "all") {
    request = request.eq("status", status);
  }

  const { data, count, error } = await request;

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return {
    posts: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  };
});
