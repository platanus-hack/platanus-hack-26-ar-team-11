import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
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
