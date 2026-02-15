/**
 * @file ESLint rule to disallow calling useState setter inside useEffect.
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow calling useState setter inside useEffect",
    },
    schema: [],
    messages: {
      noSetStateInEffect:
        "Calling useState setter '{{name}}' inside useEffect is forbidden. Consider using useEffectEvent or restructuring your logic.",
    },
  },
  create(context) {
    const setterNames = new Set();
    let useEffectDepth = 0;

    return {
      VariableDeclarator(node) {
        // Detect useState pattern: const [foo, setFoo] = useState(...)
        if (
          node.init &&
          node.init.type === "CallExpression" &&
          node.init.callee.type === "Identifier" &&
          node.init.callee.name === "useState" &&
          node.id.type === "ArrayPattern" &&
          node.id.elements.length >= 2
        ) {
          const setter = node.id.elements[1];
          if (setter && setter.type === "Identifier") {
            setterNames.add(setter.name);
          }
        }
      },

      CallExpression(node) {
        // Track entering useEffect
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useEffect"
        ) {
          useEffectDepth++;
        }

        // Check if calling a useState setter inside useEffect
        if (useEffectDepth > 0) {
          if (
            node.callee.type === "Identifier" &&
            setterNames.has(node.callee.name)
          ) {
            context.report({
              node,
              messageId: "noSetStateInEffect",
              data: { name: node.callee.name },
            });
          }
        }
      },

      "CallExpression:exit"(node) {
        // Track exiting useEffect
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useEffect"
        ) {
          useEffectDepth--;
        }
      },
    };
  },
};
