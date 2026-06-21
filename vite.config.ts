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
  },
}));
