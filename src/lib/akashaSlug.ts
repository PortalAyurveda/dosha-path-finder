// Slug for akasha_memory entries — full title, kebab-case, accent-stripped.
export function akashaSlug(titulo: string | null | undefined): string {
  if (!titulo) return "";
  return titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
