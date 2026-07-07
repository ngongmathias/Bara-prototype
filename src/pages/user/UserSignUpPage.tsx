import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSignUp, useSignIn } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ReferralService } from '@/lib/referralService';
import { UsernameService } from '@/lib/usernameService';
import { REFERRAL_PROMPT_PENDING_KEY } from '@/components/InviteFriendsPrompt';
import { COUNTRIES } from '@/data/countries';
import { DateOfBirthPicker } from '@/components/DateOfBirthPicker';

const GENDERS = ['Male', 'Female', 'Rather Not Say'] as const;

export const UserSignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const [oauthLoading, setOauthLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const refCode = searchParams.get('ref');
  const signInUrl = `/user/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;
  const finishUrl = `/auth/finish?mode=sign_up&redirect_url=${encodeURIComponent(redirectUrl)}`;

  // Persist the referral code so it survives the Clerk verification / OAuth
  // redirect and can be turned into a referral once the profile row exists.
  useEffect(() => { ReferralService.stashRef(refCode); }, [refCode]);

  // Google sign-up: new Google users are routed to /auth/complete-profile (by
  // AuthFinishPage) to collect the same fields — so no password is needed.
  const handleGoogle = async () => {
    if (!signInLoaded || !signIn) return;
    setOauthLoading(true);
    sessionStorage.setItem('bara_oauth_redirect', redirectUrl);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: finishUrl,
      });
    } catch {
      setOauthLoading(false);
    }
  };

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<string>('');
  const [country, setCountry] = useState('Rwanda');
  const [dialCode, setDialCode] = useState('+250');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 27.8.1 (revised Jul 7, Marlon meeting): the username is AUTO-SUGGESTED from
  // first + last name, shown in the form, and the user may edit it. The field
  // always has a value (suggested or user-entered).
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMsg, setUsernameMsg] = useState('');

  // Keep suggesting from the name until the user types their own.
  useEffect(() => {
    if (usernameEdited) return;
    if (!firstName.trim() && !lastName.trim()) { setUsername(''); return; }
    const timer = setTimeout(() => {
      UsernameService.proposeUsername(firstName, lastName).then((u) => {
        setUsername((prev) => prev === u ? prev : u);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [firstName, lastName, usernameEdited]);

  // Live availability feedback.
  useEffect(() => {
    const name = username.trim().toLowerCase();
    if (!name) { setUsernameStatus('idle'); setUsernameMsg(''); return; }
    const invalid = UsernameService.validate(name);
    if (invalid) { setUsernameStatus('invalid'); setUsernameMsg(invalid); return; }
    setUsernameStatus('checking');
    setUsernameMsg('Checking availability…');
    const timer = setTimeout(async () => {
      const free = await UsernameService.isAvailable(name);
      setUsernameStatus(free ? 'available' : 'taken');
      setUsernameMsg(free ? 'Available' : 'That username is taken — try another.');
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const onCountryChange = (name: string) => {
    setCountry(name);
    const match = COUNTRIES.find((c) => c.name === name);
    if (match && match.dial !== '+') setDialCode(match.dial);
  };

  const clerkError = (e: any): string =>
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || e?.message || 'Something went wrong. Please try again.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) return setError('Please enter your first and last name.');
    if (!dob) return setError('Please enter your date of birth.');
    if (!gender) return setError('Please select your gender.');
    if (!country) return setError('Please select your country.');
    if (!phone.trim()) return setError('Please enter your phone number.');
    if (!email.trim()) return setError('Please enter your email.');
    const uname = username.trim().toLowerCase();
    if (!uname) return setError('Please choose a username (we suggest one from your name).');
    const unameInvalid = UsernameService.validate(uname);
    if (unameInvalid) return setError(unameInvalid);
    if (usernameStatus === 'taken') return setError('That username is already taken. Please choose another.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      // Best-effort: also set the name on the Clerk user — wrapped so a field
      // that's disabled on the instance can't block sign-up (the profile is
      // always saved to Supabase regardless). Username is auto-derived at
      // profile-save time (27.8.1) — no username prompt at sign-up.
      try { await signUp.update({ firstName: firstName.trim(), lastName: lastName.trim() }); } catch { /* field may be disabled */ }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (e: any) {
      setError(clerkError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const saveProfile = async (clerkUserId: string) => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    // 27.8.1 — use the form's username (auto-suggested, user-editable). If it
    // became invalid/taken between typing and verifying, fall back to a fresh
    // proposal so the profile always saves with a valid, free username.
    let finalUsername = username.trim().toLowerCase();
    if (!finalUsername || UsernameService.validate(finalUsername) || !(await UsernameService.isAvailable(finalUsername))) {
      finalUsername = await UsernameService.proposeUsername(firstName, lastName);
    }
    const row = {
      clerk_user_id: clerkUserId,
      email: email.trim().toLowerCase(),
      full_name: fullName || null,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      username: finalUsername || null,
      date_of_birth: dob || null,
      gender: gender || null,
      country: country || null,
      phone: `${dialCode} ${phone.trim()}`.trim(),
      updated_at: new Date().toISOString(),
    };
    // Insert the full profile; if a row already exists (retry), update it.
    const { error: insertErr } = await supabase.from('clerk_users').insert(row);
    if (insertErr) {
      await supabase.from('clerk_users').update(row).eq('clerk_user_id', clerkUserId);
    }
    // 27.8.5 — queue the one-time "invite friends" prompt for after the redirect.
    try { sessionStorage.setItem(REFERRAL_PROMPT_PENDING_KEY, '1'); } catch { /* ignore */ }

    // Account sign-up XP bonus (admin-tunable, xp.signup — 0 disables it).
    try {
      const { GamificationService } = await import('@/lib/gamificationService');
      const signupXp = await GamificationService.getSetting('xp.signup');
      if (signupXp > 0) await GamificationService.addXP(clerkUserId, signupXp, 'Account created');
    } catch { /* non-critical */ }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    if (!code.trim()) return setError('Enter the 6-digit code we emailed you.');

    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status !== 'complete') {
        setSubmitting(false);
        return setError('That code was not accepted. Please check and try again.');
      }
      // Persist the registration profile to Supabase (the anon client is fine).
      if (result.createdUserId) {
        await saveProfile(result.createdUserId);
        // Create the referral row now that the profile exists.
        await ReferralService.createReferralOnSignup(result.createdUserId, refCode);
      }
      await setActive({ session: result.createdSessionId });
      navigate(finishUrl);
    } catch (e: any) {
      setError(clerkError(e));
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-1 text-sm text-gray-600">
            {step === 'form' ? 'Join BARA Afrika — your bridge to today’s Afrika.' : 'Verify your email to finish.'}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
          )}

          {step === 'form' ? (
            <>
            {/* Google sign-up — leads to a short "complete your profile" step,
                so we still collect the required fields without a password. */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={oauthLoading || !signInLoaded}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">or register with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First name</label>
                  <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                </div>
                <div>
                  <label className={labelCls}>Last name</label>
                  <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Date of birth</label>
                <DateOfBirthPicker value={dob} onChange={setDob} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Gender</label>
                <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="" disabled>Select…</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Country</label>
                <select className={inputCls} value={country} onChange={(e) => onCountryChange(e.target.value)}>
                  {sortedCountries.map((c) => <option key={c.iso2} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Phone number</label>
                <div className="flex gap-2">
                  <select
                    className={`${inputCls} w-24 sm:w-28 flex-shrink-0`}
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    aria-label="Country code"
                  >
                    {sortedCountries.filter((c) => c.dial !== '+').map((c) => (
                      <option key={c.iso2} value={c.dial}>{c.iso2} {c.dial}</option>
                    ))}
                  </select>
                  <input className={`${inputCls} flex-1 min-w-0`} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="numeric" placeholder="712 345 678" autoComplete="tel-national" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Pick your country code on the left, then type your number.</p>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>

              <div>
                <label className={labelCls}>Username</label>
                <input
                  className={inputCls}
                  value={username}
                  onChange={(e) => { setUsernameEdited(true); setUsername(e.target.value.toLowerCase()); }}
                  autoComplete="username"
                  placeholder="Suggested from your name — edit if you like"
                />
                {usernameMsg && (
                  <p className={`text-[11px] mt-1 ${usernameStatus === 'available' ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>{usernameMsg}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
              </div>

              {/* Clerk bot-protection mount target (used by some instances) */}
              <div id="clerk-captcha" />

              <button
                type="submit"
                disabled={submitting || !isLoaded}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Create account'}
              </button>

              {/* 28.6 — registration disclaimer acceptance */}
              <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                By creating an account you confirm your details are accurate and accept our{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-gray-600">Terms of Service</a>,{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-gray-600">Privacy Policy</a> and{' '}
                <a href="/registration-disclaimer" target="_blank" rel="noopener noreferrer" className="underline text-gray-600">Registration Disclaimer</a>.
              </p>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to={signInUrl} className="font-semibold text-gray-900 hover:underline">Sign in</Link>
              </p>
            </form>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-600">
                We emailed a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>. Enter it below to activate your account.
              </p>
              <div>
                <label className={labelCls}>Verification code</label>
                <input
                  className={`${inputCls} tracking-[0.4em] text-center text-lg`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  placeholder="••••••"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !isLoaded}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Verify & finish'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('form'); setCode(''); setError(null); }}
                className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Back to the form
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSignUpPage;
