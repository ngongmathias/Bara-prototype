/**
 * Recovery for stale code-split chunks.
 *
 * Every deploy gives the JS chunks new content-hashed filenames and the old
 * ones stop being served. A user who had the site open across a deploy still
 * holds the previous `index.html`'s module graph, so the first lazy route they
 * navigate to requests a file that no longer exists. React sees the rejected
 * dynamic import as a render error and — before this module existed — the
 * <Suspense> fallback simply span forever.
 *
 * The fix is a reload, which fetches the new index.html and its new chunk
 * names. The danger is a reload loop: if the deploy is genuinely broken the
 * reload hits the same failure and we bounce the user indefinitely. So a reload
 * is attempted at most once per RELOAD_WINDOW_MS, tracked in sessionStorage
 * (per-tab, and cleared when the tab closes — exactly the lifetime we want).
 */

const RELOAD_GUARD_KEY = 'bara:chunk-reload-at';
const RELOAD_WINDOW_MS = 30_000;

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i, // Safari
  /'text\/html' is not a valid javascript mime type/i, // SPA rewrite served index.html for a missing chunk
  /chunkloaderror/i,
  /loading chunk \S+ failed/i,
  /loading css chunk \S+ failed/i,
];

/** Is this error a missing/failed code-split chunk rather than a real app bug? */
export const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false;
  const text = `${(error as Error)?.name ?? ''} ${(error as Error)?.message ?? ''}`;
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(text));
};

/**
 * Reload once to pick up the new build. Returns false if a reload was already
 * attempted recently, meaning the caller should show a manual retry instead of
 * bouncing the user again.
 */
export const attemptChunkReload = (): boolean => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // Private mode / storage disabled — one reload is still better than a
    // permanent spinner, and without storage we can't loop-guard anyway.
  }
  window.location.reload();
  return true;
};

/**
 * Vite fires `vite:preloadError` when a modulepreload for a lazy chunk fails.
 * That happens *before* React ever renders the route, so catching it here
 * recovers the common case without the user seeing an error screen at all.
 */
export const registerChunkReloadListener = () => {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault(); // stop Vite's default throw; we handle it
    attemptChunkReload();
  });
};
