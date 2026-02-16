/**
 * @file Shared demo layout components and styles
 */

import type { CSSProperties, ReactNode } from "react";

export const demoContainerStyle: CSSProperties = {
  padding: "var(--rei-demo-space-xl, 24px)",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

export const demoSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export const demoRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

export const demoLabelStyle: CSSProperties = {
  color: "var(--rei-demo-text-secondary, #9ca3af)",
  fontSize: "12px",
  marginBottom: "4px",
};

export type DemoContainerProps = {
  title: string;
  children: ReactNode;
};

export function DemoContainer({ title, children }: DemoContainerProps) {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>{title}</h2>
      {children}
    </div>
  );
}

export type DemoSectionProps = {
  label: string;
  children: ReactNode;
  note?: string;
};

export function DemoSection({ label, children, note }: DemoSectionProps) {
  return (
    <div style={demoSectionStyle}>
      <div style={demoLabelStyle}>{label}</div>
      {children}
      {note && (
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11 }}>
          {note}
        </div>
      )}
    </div>
  );
}

export type DemoRowProps = {
  children: ReactNode;
};

export function DemoRow({ children }: DemoRowProps) {
  return <div style={demoRowStyle}>{children}</div>;
}
