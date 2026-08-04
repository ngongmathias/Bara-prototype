// Single source of truth for "is a user's registration profile complete?".
// The team requires every account to have these details. They were added to
// the sign-up form recently, so existing/returning users have a clerk_users
// row WITHOUT them — those users must be prompted to fill them in, same as
// brand-new users. Used by the global completion guard and CompleteProfilePage.

export const REQUIRED_PROFILE_FIELDS = [
  'date_of_birth',
  'gender',
  'country',
  'phone',
] as const;

export type ProfileRow = Partial<Record<(typeof REQUIRED_PROFILE_FIELDS)[number], unknown>> | null | undefined;

const hasValue = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== '';

/** True only when a profile row exists and every required field is filled. */
export function isProfileComplete(row: ProfileRow): boolean {
  if (!row) return false;
  return REQUIRED_PROFILE_FIELDS.every((f) => hasValue((row as Record<string, unknown>)[f]));
}
