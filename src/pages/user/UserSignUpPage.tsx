import { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COUNTRIES } from '@/data/countries';

const GENDERS = ['Male', 'Female', 'Rather Not Say'] as const;

export const UserSignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const signInUrl = `/user/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;
  const finishUrl = `/auth/finish?mode=sign_up&redirect_url=${encodeURIComponent(redirectUrl)}`;

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    if (!username.trim()) return setError('Please choose a username.');
    if (username.trim().length < 3) return setError('Username must be at least 3 characters.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    try {
      // Username availability (case-insensitive) against the Supabase profile.
      const { data: taken } = await supabase
        .from('clerk_users')
        .select('id')
        .ilike('username', username.trim())
        .maybeSingle();
      if (taken?.id) {
        setSubmitting(false);
        return setError('That username is already taken. Please choose another.');
      }

      await signUp.create({ emailAddress: email.trim(), password });
      // Best-effort: set the name on the Clerk user too (ignored if Name isn't
      // enabled on the Clerk instance — the profile is still saved to Supabase).
      try { await signUp.update({ firstName: firstName.trim(), lastName: lastName.trim() }); } catch { /* noop */ }

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
    const row = {
      clerk_user_id: clerkUserId,
      email: email.trim().toLowerCase(),
      full_name: fullName || null,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      username: username.trim() || null,
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
      if (result.createdUserId) await saveProfile(result.createdUserId);
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Date of birth</label>
                  <input type="date" className={inputCls} value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="" disabled>Select…</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
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
                    className={`${inputCls} w-28 flex-shrink-0`}
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    aria-label="Country code"
                  >
                    {sortedCountries.filter((c) => c.dial !== '+').map((c) => (
                      <option key={c.iso2} value={c.dial}>{c.dial} ({c.iso2})</option>
                    ))}
                  </select>
                  <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="712 345 678" autoComplete="tel-national" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Username</label>
                  <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
                </div>
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

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to={signInUrl} className="font-semibold text-gray-900 hover:underline">Sign in</Link>
              </p>
              <p className="text-center text-[11px] text-gray-400">
                Sign in with Google is available once you’ve registered.
              </p>
            </form>
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
