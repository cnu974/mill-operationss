import react from "@vitejs/plugin-react";
import tailwindPlugin from "@tailwindcss/vite";
import { defineConfig, Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to prevent TanStack Start server code from being loaded in browser
const preventTanStackServerPlugin: Plugin = {
  name: "prevent-tanstack-server",
  resolveId(id) {
    if (id.includes("@tanstack/start-server-core") || id.includes("@tanstack/react-start-server")) {
      return { id: "virtual:empty-module", external: true };
    }
    if (id === "#tanstack-router-entry" || id === "#tanstack-start-entry" || id === "#tanstack-start-plugin-adapters" || id === "tanstack-start-manifest:v") {
      return { id: "virtual:empty-module", external: true };
    }
  },
};

export default defineConfig({
  plugins: [preventTanStackServerPlugin, tailwindPlugin(), react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ["@tanstack/react-start", "@tanstack/start-server-core", "@tanstack/react-start-server"],
  },
});
