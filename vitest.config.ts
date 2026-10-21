import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
      "@application": fileURLToPath(
        new URL("./src/application", import.meta.url),
      ),
      "@infrastructure": fileURLToPath(
        new URL("./src/infrastructure", import.meta.url),
      ),
      "@presentation": fileURLToPath(
        new URL("./src/presentation", import.meta.url),
      ),
    },
  },
});
