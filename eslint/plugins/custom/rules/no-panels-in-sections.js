/**
 * @file Rule: no-panels-in-sections
 * Disallows importing from src/panels in src/sections code.
 *
 * Architecture: sections are reusable UI components that panels consume.
 * Sections should not depend on panels to maintain clean layering.
 *
 * Dependency direction: panels → sections (allowed)
 *                      sections → panels (prohibited)
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow importing from src/panels in sections code",
    },
    messages: {
      noPanelsInSections:
        "Importing from 'panels' is prohibited in sections. Panels depend on sections, not vice versa.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to files in src/sections
    if (!filename.includes("/sections/") && !filename.includes("\\sections\\")) {
      return {};
    }

    /**
     * Check if the import path references panels directory
     */
    const isPanelsPath = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      // Match paths like "../panels", "./panels", "src/panels", etc.
      return (
        sourcePath.includes("/panels/") ||
        sourcePath.includes("/panels") ||
        sourcePath.endsWith("/panels")
      );
    };

    return {
      ImportDeclaration(node) {
        if (node.source && isPanelsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noPanelsInSections",
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && isPanelsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noPanelsInSections",
          });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && isPanelsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noPanelsInSections",
          });
        }
      },
    };
  },
};
