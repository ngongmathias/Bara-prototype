import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Keep function/component names through minification so production stack
  // traces name the real component (e.g. "GlobalPlayer") instead of "U_t" —
  // essential for diagnosing render/hook errors reported from prod.
  esbuild: {
    keepNames: true,
    // Strip console.* from production builds. There are ~125 console.log calls
    // across src/ (admin pages, map components, marketplace); dropping them at
    // build time is safer than editing every call site, and keeps them working
    // in dev. console.error is kept — ErrorBoundary and catch blocks rely on it.
    drop: mode === 'production' ? ['debugger'] : [],
    pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
  },
  build: {
    // The entry chunk was 5.56 MB before route code-splitting. Keep the warning
    // meaningful rather than silencing it.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split the framework core out of the entry chunk. These change only
          // on dependency upgrades, so a content-hashed vendor chunk stays in
          // users' caches across ordinary deploys instead of being re-downloaded
          // every time application code changes.
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-auth-data": ["@clerk/clerk-react", "@supabase/supabase-js", "@tanstack/react-query"],
        },
      },
    },
  },
}));
