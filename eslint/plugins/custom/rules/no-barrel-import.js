/**
 * @file Rule: no-barrel-import
 * Disallows importing from src/components barrel export (index.ts).
 *
 * This rule prevents using the aggregated barrel export to:
 * - Avoid "broken window" anti-pattern in aggregation layers
 * - Eliminate re-export chains that hurt tree-shaking
 * - Encourage direct imports from individual component modules
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing from src/components barrel export (index.ts)",
    },
    messages: {
      noBarrelImport:
        "Importing from 'components' barrel is prohibited. Import directly from individual component modules (e.g., './components/Button/Button').",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Skip src/index.tsx (library entry point that re-exports public API)
    if (filename.endsWith("/src/index.tsx") || filename.endsWith("\\src\\index.tsx")) {
      return {};
    }

    // Skip the barrel file itself
    if (
      filename.endsWith("/components/index.ts") ||
      filename.endsWith("\\components\\index.ts")
    ) {
      return {};
    }

    /**
     * Check if the import path is a barrel import from components
     * Matches: "./components", "../components", "../../components", etc.
     * Does NOT match: "./components/Button/Button", "../components/Panel/Panel"
     */
    const isBarrelImport = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      // Match relative paths ending with /components or just "components"
      return /^\.\.?\/.*\/components$|^\.\.?\/components$|^\.\/components$/.test(
        sourcePath
      );
    };

    return {
      ImportDeclaration(node) {
        if (node.source && isBarrelImport(node.source.value)) {
          context.report({
            node,
            messageId: "noBarrelImport",
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && isBarrelImport(node.source.value)) {
          context.report({
            node,
            messageId: "noBarrelImport",
          });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && isBarrelImport(node.source.value)) {
          context.report({
            node,
            messageId: "noBarrelImport",
          });
        }
      },
    };
  },
};
