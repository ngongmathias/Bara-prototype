/**
 * Guards the post-authentication redirect against open-redirect abuse.
 *
 * Every sign-in/sign-up entry point carries the page the user came from in a
 * `?redirect_url=` parameter, and `AuthFinishPage` hands that value straight to
 * `navigate()` once Clerk reports success. Because the value is attacker-
 * controllable, a link like
 *
 *     https://baraafrika.com/auth/finish?redirect_url=//evil.example
 *
 * would send a freshly-signed-in user off-site — landing them on a page that
 * can convincingly imitate BARA at the exact moment they expect to be logged
 * in. React Router treats `//host` and `/\host` as in-app paths; browsers treat
 * them as protocol-relative URLs. That mismatch is the whole bug (and the
 * subject of the react-router advisory this app cannot yet patch, since the fix
 * requires a v7 migration).
 *
 * The rule here is deliberately strict: a redirect target must be a path on
 * this site. One leading slash, not two, and no backslash trickery. Anything
 * else falls back to a safe default rather than being "cleaned up" — silently
 * rewriting a hostile value into a plausible one is how bypasses get found.
 */

const DEFAULT_TARGET = '/';

/** True if the string contains a C0 control character or DEL. */
const hasControlChars = (value: string): boolean => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
};

export const safeRedirect = (
  target: string | null | undefined,
  fallback: string = DEFAULT_TARGET
): string => {
  if (!target) return fallback;

  // Control characters can smuggle a scheme past the checks below, because
  // browsers strip them before parsing the URL.
  if (hasControlChars(target)) return fallback;

  // Reject anything that isn't a plain in-app path.
  //   "//evil.com"  → protocol-relative, leaves the site
  //   "/\evil.com"  → same; browsers normalise the backslash to a slash
  //   "https://…"   → absolute
  //   "javascript:" → scheme injection
  // A path must start with exactly one forward slash.
  if (!target.startsWith('/')) return fallback;
  if (target.startsWith('//')) return fallback;

  // Backslashes have no legitimate place in a path this app generates.
  if (target.includes('\\')) return fallback;

  return target;
};
