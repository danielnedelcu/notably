import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { createHash } from "node:crypto";

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, "id");
  const client = serverSupabaseServiceRole<Database>(event);

  const ip =
    getRequestHeader(event, "x-forwarded-for") ??
    getRequestHeader(event, "x-real-ip") ??
    event.node.req.socket.remoteAddress ??
    "unknown";
  const userAgent = getRequestHeader(event, "user-agent") ?? "";
  const identifier = createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex");

  const [{ count }, { data: existing }] = await Promise.all([
    client
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId as string),
    client
      .from("post_likes")
      .select("id")
      .eq("post_id", postId as string)
      .eq("user_identifier", identifier)
      .single(),
  ]);

  return { liked: !!existing, count: count ?? 0 };
});
