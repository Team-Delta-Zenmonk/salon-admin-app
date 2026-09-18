import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appName = env.VITE_APP_NAME || "Veloura";

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace(/%VITE_APP_NAME%/g, appName);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 3003,
    },
  };
});

