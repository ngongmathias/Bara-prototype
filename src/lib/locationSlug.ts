/**
 * Single source of truth for slug generation for countries and communities.
 * Use this everywhere so URLs stay consistent (list, detail, footer).
 */
export function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\//g, '-')  // Replace / with - first (for diaspora names like "Black/African Americans")
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
