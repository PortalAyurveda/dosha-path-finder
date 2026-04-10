/**
 * Generate a URL-friendly slug from a video title.
 * - If title contains ":", use text before the first ":"
 * - Otherwise, use first 5 words
 * - Remove accents, lowercase, replace non-alphanumeric with "-"
 */
export function slugify(title: string): string {
  if (!title) return "video";

  // Get the relevant portion of the title
  let base = title.includes(":") ? title.split(":")[0] : title.split(/\s+/).slice(0, 5).join(" ");

  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens
}
