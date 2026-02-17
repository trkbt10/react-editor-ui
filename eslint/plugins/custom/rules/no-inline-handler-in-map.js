/**
 * @file ESLint rule to disallow inline arrow functions as event handlers inside .map() loops.
 *
 * This prevents unnecessary re-renders when using React.memo, as inline functions
 * create new references on every render.
 *
 * @example Bad
 * ```tsx
 * items.map((item) => (
 *   <TreeItem onClick={() => onSelect(item.id)} />
 * ))
 * ```
 *
 * @example Good
 * ```tsx
 * // Extract to a memoized sub-component
 * const MemoizedItem = memo(({ item, onSelect }) => {
 *   const handleClick = useCallback(() => onSelect(item.id), [item.id, onSelect]);
 *   return <TreeItem onClick={handleClick} />;
 * });
 *
 * items.map((item) => <MemoizedItem key={item.id} item={item} onSelect={onSelect} />)
 * ```
 */

const EVENT_HANDLER_PATTERN = /^on[A-Z]/;

/**
 * Check if node is inside a .map() callback
 */
function isInsideMapCallback(node) {
  let current = node.parent;
  while (current) {
    if (
      current.type === "ArrowFunctionExpression" ||
      current.type === "FunctionExpression"
    ) {
      const parent = current.parent;
      if (
        parent &&
        parent.type === "CallExpression" &&
        parent.callee &&
        parent.callee.type === "MemberExpression" &&
        parent.callee.property &&
        parent.callee.property.type === "Identifier" &&
        parent.callee.property.name === "map"
      ) {
        return true;
      }
    }
    current = current.parent;
  }
  return false;
}

/**
 * Check if JSX element is a custom component (starts with uppercase)
 */
function isCustomComponent(jsxElement) {
  const openingElement = jsxElement.openingElement;
  if (!openingElement || !openingElement.name) {
    return false;
  }

  const name = openingElement.name;
  if (name.type === "JSXIdentifier") {
    // Custom components start with uppercase (e.g., TreeItem, Button)
    return /^[A-Z]/.test(name.name);
  }
  // JSXMemberExpression (e.g., Foo.Bar) is always a custom component
  if (name.type === "JSXMemberExpression") {
    return true;
  }
  return false;
}

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow inline arrow functions as event handlers in JSX inside .map() loops",
    },
    schema: [],
    messages: {
      noInlineHandler:
        "Avoid inline arrow function for '{{prop}}' inside .map(). This creates a new function on every render, breaking React.memo optimization. Extract to a memoized sub-component with useCallback.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // Check if attribute name matches event handler pattern (onClick, onChange, etc.)
        if (
          !node.name ||
          node.name.type !== "JSXIdentifier" ||
          !EVENT_HANDLER_PATTERN.test(node.name.name)
        ) {
          return;
        }

        // Check if value is a JSXExpressionContainer with ArrowFunctionExpression
        if (
          !node.value ||
          node.value.type !== "JSXExpressionContainer" ||
          !node.value.expression ||
          node.value.expression.type !== "ArrowFunctionExpression"
        ) {
          return;
        }

        // Find the parent JSXElement
        let jsxElement = node.parent;
        while (jsxElement && jsxElement.type !== "JSXElement") {
          jsxElement = jsxElement.parent;
        }

        // Only check custom components (not DOM elements like <div>)
        if (!jsxElement || !isCustomComponent(jsxElement)) {
          return;
        }

        // Check if inside .map() callback
        if (!isInsideMapCallback(node)) {
          return;
        }

        context.report({
          node: node.value.expression,
          messageId: "noInlineHandler",
          data: { prop: node.name.name },
        });
      },
    };
  },
};
