/**
 * Converts a string into a URL-safe slug.
 * Lowercases, replaces non-alphanumeric runs with hyphens, and trims leading/trailing hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
