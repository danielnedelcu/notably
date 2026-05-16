/**
 * Formats a date string into a human-readable US locale format (e.g. "Mar 28, 2026").
 * Returns an em dash if the date is null.
 */
export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
