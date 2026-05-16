import Anthropic from "@anthropic-ai/sdk";
import { BLOG_WRITER_PROMPT } from "#server/prompts/blog-writer";

export default defineEventHandler(async (event) => {
  const { topic } = await readBody(event);

  if (!topic?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Topic is required" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: BLOG_WRITER_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a blog post about: "${topic}"`,
      },
    ],
  });

  const raw =
    message.content[0]?.type === "text" ? message.content[0].text.trim() : "";

  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to parse AI response as JSON",
      });
    }
  }
});
