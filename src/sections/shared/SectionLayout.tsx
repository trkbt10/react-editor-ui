/**
 * @file SectionLayout component - Section wrapper using ControlGroup
 */

import { memo } from "react";
import type { ReactNode } from "react";
import { ControlGroup } from "../../components/ControlRow/ControlGroup";

export type SectionLayoutProps = {
  /** Section title/label */
  title: string;
  /** Section content */
  children: ReactNode;
  /** Custom className */
  className?: string;
};

/**
 * Renders section content wrapped in ControlGroup layout.
 */
export const SectionLayout = memo(function SectionLayout({
  title,
  children,
  className,
}: SectionLayoutProps) {
  return (
    <ControlGroup label={title} className={className}>
      {children}
    </ControlGroup>
  );
});
