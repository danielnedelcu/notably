import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { createHash } from "node:crypto";

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, "id");
  const client = serverSupabaseServiceRole<Database>(event);

  // Create anonymous identifier from IP + user agent
  const ip =
    getRequestHeader(event, "x-forwarded-for") ??
    getRequestHeader(event, "x-real-ip") ??
    event.node.req.socket.remoteAddress ??
    "unknown";
  const userAgent = getRequestHeader(event, "user-agent") ?? "";
  const identifier = createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex");

  // Check if already liked
  const { data: existing } = await client
    .from("post_likes")
    .select("id")
    .eq("post_id", postId as string)
    .eq("user_identifier", identifier)
    .single();

  if (existing) {
    // Unlike — remove the like
    await client
      .from("post_likes")
      .delete()
      .eq("post_id", postId as string)
      .eq("user_identifier", identifier);

    const { count } = await client
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId as string);

    return { liked: false, count: count ?? 0 };
  }

  // Like — add the like
  await client
    .from("post_likes")
    .insert({ post_id: postId as string, user_identifier: identifier });

  const { count } = await client
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId as string);

  return { liked: true, count: count ?? 0 };
});
