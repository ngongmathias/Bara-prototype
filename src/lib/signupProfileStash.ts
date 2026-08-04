// Carries the registration info a user types on the sign-up form across the
// Google OAuth redirect. Sign-up now collects all profile details FIRST, then
// offers "Continue with Google" as an alternative to email+password — but the
// OAuth redirect leaves the page, so without this the typed values would be
// lost and CompleteProfilePage would ask for them again. Stashed in
// sessionStorage (same-origin, survives the redirect round-trip in the same
// tab) and read + cleared by CompleteProfilePage.

const KEY = 'bara_signup_profile';

export type StashedSignupProfile = {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  country?: string;
  dialIso?: string;
  phone?: string;
  username?: string;
  referralCode?: string;
};

export const SignupProfileStash = {
  save(data: StashedSignupProfile) {
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  },
  read(): StashedSignupProfile | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as StashedSignupProfile) : null;
    } catch {
      return null;
    }
  },
  clear() {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};
