/**
 * @file Rule: no-parent-type-reexport
 * Disallows the pattern of importing types from parent directories and re-exporting them.
 * Example violation:
 *   import type { Foo } from "../core/types";
 *   export type { Foo };
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing types from parent directories and re-exporting them",
    },
    messages: {
      noParentTypeReexport:
        "Re-exporting types from parent directory is prohibited. Import directly from the source instead.",
    },
    schema: [],
  },
  create(context) {
    // Track imports from parent directories
    const parentImports = new Map();

    /**
     * Check if the source path references a parent directory
     */
    const isParentPath = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      return sourcePath.startsWith("../") || sourcePath === "..";
    };

    return {
      // Track type imports from parent directories
      ImportDeclaration(node) {
        if (!node.source || !isParentPath(node.source.value)) {
          return;
        }

        // Check all specifiers (both type imports and regular imports with type specifiers)
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            // Check if this is a type import
            const isTypeImport =
              node.importKind === "type" || specifier.importKind === "type";
            if (isTypeImport) {
              const localName = specifier.local.name;
              parentImports.set(localName, {
                source: node.source.value,
                node: specifier,
              });
            }
          }
        }
      },

      // Check if exported types were imported from parent
      ExportNamedDeclaration(node) {
        // Only check exports without source (re-exports with source are handled by no-parent-reexport)
        if (node.source) {
          return;
        }

        // Check if this is a type export
        if (node.exportKind !== "type") {
          return;
        }

        for (const specifier of node.specifiers) {
          const localName = specifier.local.name;
          if (parentImports.has(localName)) {
            context.report({
              node: specifier,
              messageId: "noParentTypeReexport",
            });
          }
        }
      },
    };
  },
};
