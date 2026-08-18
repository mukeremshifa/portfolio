import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Node environment on purpose: nothing here renders a component. The tests in
 * `tests/unit/` are §5.5's cross-file invariants plus the loader's own behaviour, and
 * both read `content/` off the filesystem the same way `lib/content.ts` does.
 *
 * These are quality checks, not build gates (§5.5, §16.2). They run in `pnpm check` and
 * in CI so a violation is visible; nothing is blocked on them.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    // Mirrors tsconfig's `@/*`. Vitest does not read `paths` from tsconfig, and the
    // alternative — a plugin that does — is a dependency bought for one line.
    // `fileURLToPath` rather than `new URL().pathname`: the latter yields `/D:/…` on
    // Windows, which is not a path any resolver accepts.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
