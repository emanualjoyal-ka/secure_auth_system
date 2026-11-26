import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup/test-setup.ts"],
    env:{
      NODE_ENV:"test" // set NODE_ENV from .env to test, so can disable rate limiting in rate.Limit.middleware file
    },
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    fileParallelism: false // Prevent test files from running simultaneously
  }
});