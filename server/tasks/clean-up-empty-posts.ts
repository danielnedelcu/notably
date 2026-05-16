export default defineTask({
  meta: {
    name: "cleanup:empty-posts",
    description: "Delete empty untitled draft posts older than 1 hour",
  },
  async run() {
    await db.delete(posts).where(
      and(
        eq(posts.status, "draft"),
        or(isNull(posts.title), eq(posts.title, "")),
        or(isNull(posts.content), eq(posts.content, "")),
        lt(posts.created_at, new Date(Date.now() - 60 * 60 * 1000)), // older than 1hr
      ),
    );
    return { result: "ok" };
  },
});
