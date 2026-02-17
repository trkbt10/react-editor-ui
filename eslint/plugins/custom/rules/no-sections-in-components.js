/**
 * @file Rule: no-sections-in-components
 * Disallows importing from src/sections in src/components code.
 *
 * Architecture: sections are mid-level composites that use components.
 * Components should not depend on sections to maintain clean layering.
 *
 * Dependency direction: panels → sections → components
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow importing from src/sections in components code",
    },
    messages: {
      noSectionsInComponents:
        "Importing from 'sections' is prohibited in components. Sections depend on components, not vice versa.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to files in src/components
    if (!filename.includes("/components/") && !filename.includes("\\components\\")) {
      return {};
    }

    /**
     * Check if the import path references sections directory
     */
    const isSectionsPath = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      // Match paths like "../sections", "./sections", "src/sections", etc.
      return (
        sourcePath.includes("/sections/") ||
        sourcePath.includes("/sections") ||
        sourcePath.endsWith("/sections")
      );
    };

    return {
      ImportDeclaration(node) {
        if (node.source && isSectionsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noSectionsInComponents",
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && isSectionsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noSectionsInComponents",
          });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && isSectionsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noSectionsInComponents",
          });
        }
      },
    };
  },
};
