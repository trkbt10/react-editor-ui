/**
 * @file ESLint rule to prefer PointerEvent over MouseEvent handlers.
 */

const MOUSE_TO_POINTER_MAP = {
  onMouseDown: "onPointerDown",
  onMouseUp: "onPointerUp",
  onMouseMove: "onPointerMove",
  onMouseEnter: "onPointerEnter",
  onMouseLeave: "onPointerLeave",
  onMouseOver: "onPointerOver",
  onMouseOut: "onPointerOut",
};

const MOUSE_EVENT_NAMES = Object.keys(MOUSE_TO_POINTER_MAP);

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer PointerEvent handlers over MouseEvent handlers",
    },
    schema: [],
    messages: {
      preferPointerEvent:
        "Prefer '{{pointerEvent}}' over '{{mouseEvent}}'. PointerEvent provides better cross-device support.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier") {
          return;
        }

        const attrName = node.name.name;

        if (MOUSE_EVENT_NAMES.includes(attrName)) {
          context.report({
            node,
            messageId: "preferPointerEvent",
            data: {
              mouseEvent: attrName,
              pointerEvent: MOUSE_TO_POINTER_MAP[attrName],
            },
          });
        }
      },
    };
  },
};
