/**
 * Sanitizes a filename into a URL-safe slug:
 * - removes accents
 * - converts to lowercase
 * - replaces spaces and underscores with hyphens
 * - removes non-alphanumeric characters (except hyphens and dots)
 * - collapses multiple hyphens
 */
export function sanitizeSlug(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.substring(lastDot) : '';

  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // spaces/underscores → hyphens
    .replace(/[^a-z0-9\-]/g, '') // remove special chars
    .replace(/-{2,}/g, '-') // collapse hyphens
    .replace(/^-|-$/g, ''); // trim hyphens

  return slug + ext.toLowerCase();
}
