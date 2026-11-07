import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Testing Library hooks into the global afterEach and beforeAll for its
    // automatic cleanup and React act() setup.
    globals: true,
  },
});
