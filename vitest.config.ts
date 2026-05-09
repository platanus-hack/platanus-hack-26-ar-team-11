import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    environmentMatchGlobs: [
      ["src/components/landing/**", "jsdom"],
    ],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: [
      "src/**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
      "worker/**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "worker/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", ".next", "references"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
