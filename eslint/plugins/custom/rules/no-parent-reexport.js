/**
 * @file Rule: no-parent-reexport
 * Disallows re-exporting from parent directories: export { a } from "../module"
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow re-exporting from parent directories",
    },
    messages: {
      noParentReexport:
        "Re-exporting from parent directory is prohibited. Export only from current or child directories.",
    },
    schema: [],
  },
  create(context) {
    /**
     * Check if the source path references a parent directory
     */
    const isParentPath = (sourcePath) => {
      if (typeof sourcePath !== "string") {
        return false;
      }
      return sourcePath.startsWith("../") || sourcePath.startsWith("..");
    };

    return {
      ExportNamedDeclaration(node) {
        if (node.source && isParentPath(node.source.value)) {
          context.report({
            node,
            messageId: "noParentReexport",
          });
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && isParentPath(node.source.value)) {
          context.report({
            node,
            messageId: "noParentReexport",
          });
        }
      },
    };
  },
};
