import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Spec §11 targets WCAG 2.2 AA. next/core-web-vitals registers eslint-plugin-jsx-a11y
  // but enables only a subset of its rules, so take the recommended set on top. Rules
  // only, not the plugin: registering it a second time is a flat-config error, and
  // eslint-config-next already resolves the same 6.10.2 package.
  {
    name: "jsx-a11y/recommended-rules",
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  // `no-noninteractive-tabindex` allows `tabpanel` and nothing else out of the box. A
  // scrollable region is the other case where a non-interactive element has to be
  // focusable: a `<pre>` with `overflow-x: auto` is unreachable by keyboard without a tab
  // stop, and §8.3 requires `tabindex="0"`, `role="region"`, and an `aria-label` on code
  // blocks for exactly that reason. Allowing the role here states the decision once,
  // rather than suppressing the rule at each site that implements it correctly.
  {
    name: "jsx-a11y/scrollable-regions-are-focusable",
    rules: {
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
