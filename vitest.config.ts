import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests only — pure functions in lib/, no Next.js runtime, no
// database, no browser. See lib/**/*.test.ts and TESTING.md for what
// this does and doesn't cover.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
