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

  const formData = await readFormData(event);
  const file = formData.get("file") as File;

  if (!file)
    throw createError({ statusCode: 400, message: "No file provided" });

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      message: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.",
    });
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw createError({
      statusCode: 400,
      message: "File too large. Maximum size is 5MB.",
    });
  }

  const adminClient = serverSupabaseServiceRole<Database>(event);

  // Generate a unique filename
  const ext = file.name.split(".").pop();
  const filename = `${user.id}-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await adminClient.storage
    .from("post-images")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw createError({ statusCode: 500, message: error.message });

  const {
    data: { publicUrl },
  } = adminClient.storage.from("post-images").getPublicUrl(filename);

  return { url: publicUrl };
});
