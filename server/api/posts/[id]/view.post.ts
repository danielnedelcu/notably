import { serverSupabaseServiceRole } from "#supabase/server";
import { createHash } from "crypto";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Hash the IP for privacy — we never store the raw IP
  const ip =
    getHeader(event, "x-forwarded-for")?.split(",")[0].trim() ??
    getHeader(event, "x-real-ip") ??
    "unknown";

  const ipHash = createHash("sha256").update(ip).digest("hex");
  const userAgent = getHeader(event, "user-agent") ?? "";

  // Deduplicate — don't count the same IP twice within 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: existing } = await adminClient
    .from("post_views")
    .select("id")
    .eq("post_id", id as string)
    .eq("ip_hash", ipHash)
    .gte("viewed_at", oneHourAgo)
    .maybeSingle();

  if (existing) {
    return { counted: false };
  }

  await adminClient.from("post_views").insert({
    post_id: id as string,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  return { counted: true };
});
