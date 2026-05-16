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

  const adminClient = serverSupabaseServiceRole<Database>(event);

  const now = new Date();
  const startOf7DaysAgo = new Date(now);
  startOf7DaysAgo.setDate(now.getDate() - 7);
  startOf7DaysAgo.setHours(0, 0, 0, 0);

  const startOf30DaysAgo = new Date(now);
  startOf30DaysAgo.setDate(now.getDate() - 30);
  startOf30DaysAgo.setHours(0, 0, 0, 0);

  // 6 months back from start of current month
  const startOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Get all post IDs belonging to this user
  const { data: userPosts } = await adminClient
    .from("posts")
    .select("id")
    .eq("user_id", user.id);

  const postIds = userPosts?.map((p) => p.id) ?? [];

  if (postIds.length === 0) {
    return {
      total: 0,
      last7Days: 0,
      last30Days: 0,
      byDay: [],
      topPosts: [],
    };
  }

  // Total all-time views
  const { count: total } = await adminClient
    .from("post_views")
    .select("*", { count: "exact", head: true })
    .in("post_id", postIds);

  // Views in last 7 days
  const { count: last7Days } = await adminClient
    .from("post_views")
    .select("*", { count: "exact", head: true })
    .in("post_id", postIds)
    .gte("viewed_at", startOf7DaysAgo.toISOString());

  // Views in last 30 days
  const { count: last30Days } = await adminClient
    .from("post_views")
    .select("*", { count: "exact", head: true })
    .in("post_id", postIds)
    .gte("viewed_at", startOf30DaysAgo.toISOString());

  // Views per day for the last 6 months (for chart)
  const { data: rawViews } = await adminClient
    .from("post_views")
    .select("viewed_at")
    .in("post_id", postIds)
    .gte("viewed_at", startOf6MonthsAgo.toISOString())
    .order("viewed_at", { ascending: true });

  // Group by day
  const byDayMap: Record<string, number> = {};
  for (const view of rawViews ?? []) {
    const day = new Date(view.viewed_at).toISOString().split("T")[0];
    byDayMap[day] = (byDayMap[day] ?? 0) + 1;
  }
  const byDay = Object.entries(byDayMap).map(([date, count]) => ({
    date,
    count,
  }));

  // Top 5 most viewed posts
  const { data: topPostViews } = await adminClient
    .from("post_views")
    .select("post_id")
    .in("post_id", postIds);

  const viewsByPost: Record<string, number> = {};
  for (const v of topPostViews ?? []) {
    viewsByPost[v.post_id] = (viewsByPost[v.post_id] ?? 0) + 1;
  }

  const topPostIds = Object.entries(viewsByPost)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  const { data: topPostData } = await adminClient
    .from("posts")
    .select("id, title, slug")
    .in("id", topPostIds.length > 0 ? topPostIds : ["none"]);

  const topPosts = topPostIds.map((postId) => ({
    id: postId,
    title: topPostData?.find((p) => p.id === postId)?.title ?? "Untitled",
    slug: topPostData?.find((p) => p.id === postId)?.slug ?? "",
    views: viewsByPost[postId] ?? 0,
  }));

  return {
    total: total ?? 0,
    last7Days: last7Days ?? 0,
    last30Days: last30Days ?? 0,
    byDay,
    topPosts,
  };
});
