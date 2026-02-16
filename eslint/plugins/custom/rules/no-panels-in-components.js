/**
 * @file Rule: no-panels-in-components
 * Disallows importing from src/panels in src/components code.
 *
 * Architecture: panels are higher-level composites that use components.
 * Components should not depend on panels to maintain clean layering.
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow importing from src/panels in components code",
    },
    messages: {
      noPanelsInComponents:
        "Importing from 'src/panels' is prohibited in components. Panels are a higher-level layer that depends on components, not vice versa.",
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
            messageId: "noPanelsInComponents",
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && isPanelsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noPanelsInComponents",
          });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && isPanelsPath(node.source.value)) {
          context.report({
            node,
            messageId: "noPanelsInComponents",
          });
        }
      },
    };
  },
};
