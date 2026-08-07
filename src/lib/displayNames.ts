import { supabase } from '@/lib/supabase';

/** Shown when a user has no resolvable name, instead of a raw Clerk id. */
export const FALLBACK_DISPLAY_NAME = 'BARA member';

/**
 * Public-facing name for a user.
 *
 * Prefers the username, which is the only field a user explicitly chooses as
 * their public handle. Falling back to the signup name, it abbreviates to a
 * first name plus a last initial — that name comes from Clerk registration
 * and was never offered as something the world would see, so publishing it
 * whole on a listing page would surface more than the person agreed to.
 *
 * Business accounts (`Umwiru Tours Ltd` becoming `Umwiru T.`) are the cost of
 * that default; they can set a username to control how they appear.
 */
export const toDisplayName = (row: {
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}): string => {
  const username = row.username?.trim();
  if (username) return username;

  const first = row.first_name?.trim();
  const last = row.last_name?.trim();
  if (first) return last ? `${first} ${last[0].toUpperCase()}.` : first;

  const full = row.full_name?.trim().replace(/\s+/g, ' ');
  if (!full) return FALLBACK_DISPLAY_NAME;

  // Strip stray punctuation-only trailing tokens, e.g. "The Red Trucks .".
  const words = full.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (words.length === 0) return FALLBACK_DISPLAY_NAME;
  if (words.length === 1) return words[0];
  return `${words[0]} ${words[1][0].toUpperCase()}.`;
};

/** Two-letter avatar initials derived from an already-formatted display name. */
export const toInitials = (displayName: string): string => {
  const words = displayName.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

/**
 * Resolve Clerk user ids to public display names.
 *
 * Deliberately selects no email column. `clerk_users` is readable with the
 * anon key that ships in the browser bundle, so anything requested here is
 * effectively published; names are the only part of that row this needs.
 */
export const resolveDisplayNames = async (
  userIds: Array<string | null | undefined>
): Promise<Record<string, string>> => {
  const unique = Array.from(new Set(userIds.filter(Boolean) as string[]));
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from('clerk_users')
    .select('clerk_user_id, username, first_name, last_name, full_name')
    .in('clerk_user_id', unique);

  if (error) {
    console.warn('Could not resolve display names', error);
    return {};
  }

  const map: Record<string, string> = {};
  (data || []).forEach((row: any) => {
    map[row.clerk_user_id] = toDisplayName(row);
  });
  return map;
};
