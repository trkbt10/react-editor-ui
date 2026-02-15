/**
 * @file Rule: no-export-star
 * Disallows wildcard re-exports: export * from "./module"
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow wildcard re-exports (export * from)",
    },
    messages: {
      noExportStar: "Wildcard re-export is prohibited. Use explicit named exports instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportAllDeclaration(node) {
        context.report({
          node,
          messageId: "noExportStar",
        });
      },
    };
  },
};
