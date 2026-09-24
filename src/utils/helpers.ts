export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
export function generateSlug(name: string): string {
  const shortId = Math.random().toString(36).substring(2, 6);
  return `${slugify(name)}-${shortId}`;
}
