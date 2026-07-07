import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COUNTRIES } from '@/data/countries';
import { DateOfBirthPicker } from '@/components/DateOfBirthPicker';
import { ReferralService } from '@/lib/referralService';
import { UsernameService } from '@/lib/usernameService';
import { REFERRAL_PROMPT_PENDING_KEY } from '@/components/InviteFriendsPrompt';

const GENDERS = ['Male', 'Female', 'Rather Not Say'] as const;

// Shown to a NEW Google/social user right after OAuth: collect the same
// registration fields as the email/password form, minus email & password
// (those come from the OAuth provider). Existing users never see this.
export const CompleteProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  const redirectUrl = new URLSearchParams(location.search).get('redirect_url') || '/';

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [dialCode, setDialCode] = useState('+250');
  const [phone, setPhone] = useState('');
  // 27.8.1 (revised Jul 7): username is auto-suggested from the name, shown,
  // and editable — the field always carries a value.
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMsg, setUsernameMsg] = useState('');

  useEffect(() => {
    if (usernameEdited) return;
    if (!firstName.trim() && !lastName.trim()) { setUsername(''); return; }
    const timer = setTimeout(() => {
      UsernameService.proposeUsername(firstName, lastName).then((u) => {
        setUsername((prev) => (prev === u ? prev : u));
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [firstName, lastName, usernameEdited]);

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

  const email = user?.primaryEmailAddress?.emailAddress || '';

  // Guard: must be signed in; if a profile already exists, skip straight through.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      navigate(`/user/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    (async () => {
      const { data } = await supabase
        .from('clerk_users')
        .select('id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      if (data?.id) {
        navigate(redirectUrl); // already has a profile — nothing to complete
        return;
      }
      setChecking(false);
    })();
  }, [isLoaded, isSignedIn, user, navigate, redirectUrl]);

  const onCountryChange = (name: string) => {
    setCountry(name);
    const match = COUNTRIES.find((c) => c.name === name);
    if (match && match.dial !== '+') setDialCode(match.dial);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!firstName.trim() || !lastName.trim()) return setError('Please enter your first and last name.');
    if (!dob) return setError('Please enter your date of birth.');
    if (!gender) return setError('Please select your gender.');
    if (!country) return setError('Please select your country.');
    if (!phone.trim()) return setError('Please enter your phone number.');
    const uname = username.trim().toLowerCase();
    if (!uname) return setError('Please choose a username (we suggest one from your name).');
    const unameInvalid = UsernameService.validate(uname);
    if (unameInvalid) return setError(unameInvalid);
    if (usernameStatus === 'taken') return setError('That username is already taken. Please choose another.');

    setSubmitting(true);
    try {
      // 27.8.1 — use the form's username (auto-suggested, user-editable);
      // fall back to a fresh proposal if it was taken in a race.
      let finalUsername = uname;
      if (!(await UsernameService.isAvailable(finalUsername))) {
        finalUsername = await UsernameService.proposeUsername(firstName, lastName);
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const row = {
        clerk_user_id: user.id,
        email: email.toLowerCase(),
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
      const { error: insertErr } = await supabase.from('clerk_users').insert(row);
      if (insertErr) {
        await supabase.from('clerk_users').update(row).eq('clerk_user_id', user.id);
      }

      // Turn a captured ?ref= (stashed at sign-up before the OAuth redirect)
      // into a pending referral now that the profile row exists.
      await ReferralService.createReferralOnSignup(user.id, ReferralService.getRefFromUrl());

      // Best-effort: reflect the name on the Clerk user too.
      try { await user.update({ firstName: firstName.trim(), lastName: lastName.trim() }); } catch { /* noop */ }

      // 27.8.5 — queue the one-time "invite friends" prompt for after the redirect.
      try { sessionStorage.setItem(REFERRAL_PROMPT_PENDING_KEY, '1'); } catch { /* ignore */ }

      // Account sign-up XP bonus (admin-tunable, xp.signup — 0 disables it).
      try {
        const { GamificationService } = await import('@/lib/gamificationService');
        const signupXp = await GamificationService.getSetting('xp.signup');
        if (signupXp > 0) await GamificationService.addXP(user.id, signupXp, 'Account created');
      } catch { /* non-critical */ }

      navigate(redirectUrl);
    } catch (e: any) {
      setError(e?.message || 'Could not save your profile. Please try again.');
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1';

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-900" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Complete your profile</h2>
          <p className="mt-1 text-sm text-gray-600">
            A few more details to finish setting up your BARA Afrika account.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {email && (
              <div>
                <label className={labelCls}>Email</label>
                <input className={`${inputCls} bg-gray-50 text-gray-500`} value={email} disabled />
              </div>
            )}

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
                <select className={`${inputCls} w-24 sm:w-28 flex-shrink-0`} value={dialCode} onChange={(e) => setDialCode(e.target.value)} aria-label="Country code">
                  {sortedCountries.filter((c) => c.dial !== '+').map((c) => (
                    <option key={c.iso2} value={c.dial}>{c.iso2} {c.dial}</option>
                  ))}
                </select>
                <input className={`${inputCls} flex-1 min-w-0`} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="numeric" placeholder="712 345 678" autoComplete="tel-national" />
              </div>
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Finish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
