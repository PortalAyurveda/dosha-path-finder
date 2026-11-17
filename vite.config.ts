// manualChunks: never group @radix-ui — it pulls lazy-only UI into the first load.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    target: "es2020",
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Bibliotecas grandes em arquivos próprios: ficam em cache entre publicações.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) return "framer-motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "react-query";
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run)\//.test(id)) return "react";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react-dom", "react-dom/client", "@radix-ui/react-tooltip", "@radix-ui/react-portal"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
