import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

var resolvePath = (path: string): string =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "سلامت",
        short_name: "سلامت",
        description: "همراه روزانه سلامت تغذیه، فعالیت، چکاپ و عادت‌ها",
        lang: "fa",
        dir: "rtl",
        display: "standalone",
        start_url: "/",
        theme_color: "#0f766e",
        background_color: "#f8fafc",
        icons: [
          { src: "icons/icon-48.png", sizes: "48x48", type: "image/png" },
          { src: "icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-144.png", sizes: "144x144", type: "image/png" },
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: { navigateFallback: "index.html", cleanupOutdatedCaches: true },
    }),
  ],
  resolve: {
    alias: {
      "@domain": resolvePath("./src/domain"),
      "@application": resolvePath("./src/application"),
      "@infrastructure": resolvePath("./src/infrastructure"),
      "@presentation": resolvePath("./src/presentation"),
    },
  },
});
