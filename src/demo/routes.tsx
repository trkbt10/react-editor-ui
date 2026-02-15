/**
 * @file Demo route configuration
 */

import type { ReactNode } from "react";

export type DemoPage = {
  id: string;
  label: string;
  path: string;
  element: ReactNode;
};

export type DemoCategory = {
  id: string;
  label: string;
  base: string;
  pages: DemoPage[];
};

/**
 * Placeholder component for components not yet implemented
 */
const Placeholder = ({ name }: { name: string }) => (
  <div
    style={{
      padding: "var(--rei-demo-space-xl)",
      color: "var(--rei-demo-text-secondary)",
    }}
  >
    <h2 style={{ margin: "0 0 8px", color: "var(--rei-demo-text-primary)" }}>
      {name}
    </h2>
    <p style={{ margin: 0 }}>This component is not yet implemented.</p>
  </div>
);

export const demoCategories: DemoCategory[] = [
  {
    id: "buttons",
    label: "Buttons",
    base: "/components/buttons",
    pages: [
      {
        id: "basic",
        label: "Basic",
        path: "basic",
        element: <Placeholder name="Button - Basic" />,
      },
      {
        id: "icon",
        label: "Icon Button",
        path: "icon",
        element: <Placeholder name="Button - Icon" />,
      },
    ],
  },
  {
    id: "inputs",
    label: "Inputs",
    base: "/components/inputs",
    pages: [
      {
        id: "text",
        label: "Text Input",
        path: "text",
        element: <Placeholder name="Input - Text" />,
      },
      {
        id: "select",
        label: "Select",
        path: "select",
        element: <Placeholder name="Input - Select" />,
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    base: "/components/feedback",
    pages: [
      {
        id: "tooltip",
        label: "Tooltip",
        path: "tooltip",
        element: <Placeholder name="Tooltip" />,
      },
      {
        id: "toast",
        label: "Toast",
        path: "toast",
        element: <Placeholder name="Toast" />,
      },
    ],
  },
];
