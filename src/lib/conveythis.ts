/**
 * ConveyThis — whole-site machine translation.
 *
 * Replaces the Google Translate widget that used to live in
 * `src/components/GoogleTranslate.tsx`. Google discontinued that widget for
 * commercial sites in December 2019 (non-profit, government and academic only),
 * so BARA was running it outside its terms with no support and no warning if it
 * stopped. It also reloaded the whole page from a 500ms timer whenever the
 * language cookie changed, which is what made switching languages feel broken.
 *
 * ConveyThis works the same way from our side — one script, it translates the
 * rendered DOM, nothing to maintain per string — but it is a supported product,
 * and it is built on Google's engine so it covers Kinyarwanda, which most
 * competitors do not.
 *
 * Loaded here rather than hardcoded into index.html for two reasons: the key is
 * environment-specific, and a missing key must be a no-op rather than a broken
 * script tag pointing at `?api_key=undefined`. That means this branch can be
 * merged safely before the account exists.
 */

const SCRIPT_ID = 'conveythis-script';

export const initConveyThis = (): void => {
  const apiKey = import.meta.env.VITE_CONVEYTHIS_API_KEY;

  // No key configured (any environment that hasn't set it) — do nothing at all
  // rather than requesting the CDN with an empty key.
  if (!apiKey) return;

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = `https://cdn.conveythis.com/javascript/conveythis.js?api_key=${encodeURIComponent(apiKey)}`;
  script.async = true;
  script.onerror = () => {
    // Never let a third-party outage look like a site fault; the page is fully
    // usable in English without it.
    console.warn('ConveyThis failed to load — the site stays in English.');
  };
  document.head.appendChild(script);
};
