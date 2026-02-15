/**
 * @file ESLint rule to disallow IIFE (Immediately Invoked Function Expression).
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow IIFE (Immediately Invoked Function Expression)",
    },
    schema: [],
    messages: {
      noIife: "IIFE is forbidden. Extract the function and call it separately.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;

        // Check for (function() {})() or (() => {})()
        if (
          callee.type === "FunctionExpression" ||
          callee.type === "ArrowFunctionExpression"
        ) {
          context.report({ node, messageId: "noIife" });
          return;
        }

        // Check for (function() {}).call(...) or (function() {}).apply(...)
        if (
          callee.type === "MemberExpression" &&
          (callee.object.type === "FunctionExpression" ||
            callee.object.type === "ArrowFunctionExpression") &&
          callee.property.type === "Identifier" &&
          (callee.property.name === "call" || callee.property.name === "apply")
        ) {
          context.report({ node, messageId: "noIife" });
        }
      },
    };
  },
};
