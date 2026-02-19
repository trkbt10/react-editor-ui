/**
 * @file ESLint flat config for the repository.
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import jsdocPlugin from "eslint-plugin-jsdoc";
import eslintComments from "eslint-plugin-eslint-comments";
import prettierConfig from "eslint-config-prettier";
// Local plugin and modularized rule groups
import customPlugin from "./eslint/plugins/custom/index.js";
import rulesJSDoc from "./eslint/rules/rules-jsdoc.js";
import rulesRestrictedSyntax from "./eslint/rules/rules-restricted-syntax.js";
import rulesCurly from "./eslint/rules/rules-curly.js";
import rulesNoTestImports from "./eslint/rules/rules-no-test-imports.js";
import rulesNoMocks from "./eslint/rules/rules-no-mocks.js";
import rulesNoDirectIconImports from "./eslint/rules/rules-no-direct-icon-imports.js";

export default [
  // Ignore patterns
  { ignores: ["node_modules/**", "dist/**", "build/**", "debug/**", "*.config.ts", ".code_styles/**", "src/demo/**"] },

  // JS/TS recommended sets (Flat-compatible)
  ...tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    // Disable conflicting Prettier rules (Flat-compatible eslint-config-prettier)
    prettierConfig,

    // Project common rules from here
    {
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
        },
      },
      plugins: {
        import: importPlugin,
        jsdoc: jsdocPlugin,
        "eslint-comments": eslintComments,
        "@typescript-eslint": tseslint.plugin,
        custom: customPlugin,
      },
      settings: {
        jsdoc: { mode: "typescript" },
      },
      rules: {
        "custom/ternary-length": "error",
        "custom/prefer-node-protocol": "error",
        "custom/no-as-outside-guard": "error",
        "custom/no-nested-try": "error",
        "custom/no-iife-in-anonymous": "error",
        "custom/no-export-star": "error",
        "custom/no-parent-reexport": "error",
        "custom/no-demo-import": "error",
        "custom/no-parent-type-reexport": "error",
        "custom/no-barrel-import": "error",
        "custom/no-component-index": "error",
        "custom/no-panels-in-components": "error",
        "custom/no-panels-in-sections": "error",
        "custom/no-sections-in-components": "error",
        "custom/no-canvas-import": "error",
        // Forbid disabling critical architectural rules via eslint-disable comments
        "eslint-comments/no-restricted-disable": [
          "error",
          "custom/no-parent-reexport",
          "custom/no-parent-type-reexport",
        ],
        "import/no-cycle": ["error", { maxDepth: 10 }],
        "custom/no-use-state-in-use-effect": "error",
        "custom/prefer-pointer-events": "warn",
        "custom/no-iife": "error",
        "custom/no-inline-handler-in-map": "warn",
        "custom/no-redundant-type-alias": "error",
        // Spread from modular groups
        ...rulesJSDoc,
        ...rulesRestrictedSyntax,
        // /* 3. Prohibit relative parent import (../../ etc.) */
        // "import/no-relative-parent-imports": "error",
        ...rulesCurly,
        ...rulesNoTestImports,
        ...rulesNoMocks,
      },
    },

    // Tests-only: allow global test APIs so imports are unnecessary
    {
      files: [
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "spec/**/*.ts",
        "spec/**/*.tsx",
        "spec/**/*.js",
        "spec/**/*.jsx",
      ],
      languageOptions: {
        globals: {
          // Core
          describe: "readonly",
          it: "readonly",
          test: "readonly",
          expect: "readonly",
          // Lifecycle
          beforeAll: "readonly",
          afterAll: "readonly",
          beforeEach: "readonly",
          afterEach: "readonly",
          // Suites/bench (Vitest-compatible)
          suite: "readonly",
          bench: "readonly",
          // Vitest mocking (allowed in tests)
          vi: "readonly",
        },
      },
      rules: {
        // Allow mock APIs in test files
        "no-restricted-globals": "off",
        "no-restricted-properties": "off",
      },
    },

    // Internal ESLint plugin/rules: don't enforce custom rules on their own source
    {
      files: ["eslint/**"],
      rules: {
        "custom/ternary-length": "off",
        "custom/no-as-outside-guard": "off",
        "custom/no-nested-try": "off",
        "custom/no-iife-in-anonymous": "off",
        "custom/no-use-state-in-use-effect": "off",
        "custom/prefer-pointer-events": "off",
        "custom/no-iife": "off",
      },
    },
  ),

  // Forbid direct imports from react-icons (must use centralized icons module)
  // Applies to all source files EXCEPT src/icons/** (the icons module itself)
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/icons/**", "src/demo/**"],
    rules: {
      ...rulesNoDirectIconImports,
    },
  },
];
