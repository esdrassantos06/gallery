import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".claude",
      "**/dist",
      "**/node_modules",
      "playwright-report",
      "test-results",
      "*.tgz",
      "docs/.next",
      "docs/.source",
      "docs/out",
      "docs/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.test.{ts,tsx}", "e2e/**"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
);
