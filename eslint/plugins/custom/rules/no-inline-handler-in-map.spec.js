/**
 * @file Tests for no-inline-handler-in-map rule
 */
import { RuleTester } from "eslint";
import rule from "./no-inline-handler-in-map.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run("no-inline-handler-in-map", rule, {
  valid: [
    // DOM elements are allowed
    {
      code: `items.map((item) => <div onClick={() => handleClick(item.id)} />)`,
    },
    // Outside of map is allowed
    {
      code: `<TreeItem onClick={() => handleClick()} />`,
    },
    // Using a variable reference is allowed
    {
      code: `items.map((item) => <TreeItem onClick={handleClick} />)`,
    },
    // Nested in JSX but not in map callback
    {
      code: `<List>{items.map((item) => <div key={item.id}>{item.name}</div>)}</List>`,
    },
    // Non-event props are allowed
    {
      code: `items.map((item) => <TreeItem render={() => <span />} />)`,
    },
  ],
  invalid: [
    // Inline arrow function for onClick in map
    {
      code: `items.map((item) => <TreeItem onClick={() => onSelect(item.id)} />)`,
      errors: [{ messageId: "noInlineHandler", data: { prop: "onClick" } }],
    },
    // Multiple handlers
    {
      code: `items.map((item) => (
        <TreeItem
          onClick={() => onSelect(item.id)}
          onToggle={() => onToggle(item.id)}
        />
      ))`,
      errors: [
        { messageId: "noInlineHandler", data: { prop: "onClick" } },
        { messageId: "noInlineHandler", data: { prop: "onToggle" } },
      ],
    },
    // Nested custom component
    {
      code: `items.map((item) => (
        <div>
          <Button onClick={() => handleClick(item.id)} />
        </div>
      ))`,
      errors: [{ messageId: "noInlineHandler", data: { prop: "onClick" } }],
    },
    // Using .map on different objects
    {
      code: `data.items.map((item) => <MyComponent onChange={() => update(item)} />)`,
      errors: [{ messageId: "noInlineHandler", data: { prop: "onChange" } }],
    },
  ],
});

console.log("All tests passed!");
