// Narrow ESLint config used by CI to enforce the Rules of Hooks, and nothing
// else.
//
// Why this exists as a separate config: a misplaced `useMemo` in
// PostListing.tsx crashed the marketplace posting form on every render for
// four months (14 Apr – 06 Aug 2026) — zero listings created, no console
// error, nothing written to the database, because the ErrorBoundary swallowed
// it. A second instance was found in DbPopupAd.tsx at the same time, where it
// broke the component precisely when there WAS an ad to display.
//
// Neither `tsc` nor the production build detects this, so it needs a lint
// gate. The main config can't serve that purpose today: ~208 files carry
// pre-existing errors (mostly `no-explicit-any`), so wiring `npm run lint`
// into CI would fail on the first run and promptly be disabled. Keeping this
// gate narrow is what keeps it trustworthy.
//
// Widen or delete this file once the main lint backlog is cleared.

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'supabase/functions'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    // This config deliberately runs only one rule, so every legitimate
    // `eslint-disable react-hooks/exhaustive-deps` in the codebase looks
    // "unused" from here and would warn. That noise is about the narrowness
    // of this gate, not about the code it is checking.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
);
