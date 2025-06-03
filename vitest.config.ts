/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setupTests.ts"],
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "node_modules/**",
      "mcp-servers/**/node_modules/**",
      "dist/**",
      ".idea/**",
      ".git/**",
      ".cache/**",
      "tests/e2e/**",
      "playwright-report/**",
      "test-results/**",
    ],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "mcp-servers/**/node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/*.spec.{js,jsx,ts,tsx}",
        "**/types.ts",
        "**/index.ts",
        "**/vite-env.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@test-utils": path.resolve(__dirname, "./tests/test-utils"),
    },
  },
} as any);
