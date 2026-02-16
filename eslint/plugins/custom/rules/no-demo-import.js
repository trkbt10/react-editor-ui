/**
 * @file Rule: no-demo-import
 * Disallows importing from src/demo in production code.
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow importing from src/demo in production code",
    },
    messages: {
      noDemoImport:
        "Importing from 'src/demo' is prohibited in production code.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Skip if we're already in demo directory
    if (filename.includes("/demo/") || filename.includes("\\demo\\")) {
      return {};
    }

    /**
     * Check if the import path references demo directory
     */
    const isDemoPath = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      // Match paths like "../demo", "./demo", "src/demo", etc.
      return (
        sourcePath.includes("/demo/") ||
        sourcePath.includes("/demo") ||
        sourcePath.endsWith("/demo") ||
        sourcePath === "demo"
      );
    };

    return {
      ImportDeclaration(node) {
        if (node.source && isDemoPath(node.source.value)) {
          context.report({
            node,
            messageId: "noDemoImport",
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && isDemoPath(node.source.value)) {
          context.report({
            node,
            messageId: "noDemoImport",
          });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && isDemoPath(node.source.value)) {
          context.report({
            node,
            messageId: "noDemoImport",
          });
        }
      },
    };
  },
};
