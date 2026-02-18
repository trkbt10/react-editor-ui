/**
 * @file PropertySection component - Section wrapper with collapsible header
 *
 * @description
 * A collapsible section container with a header and optional action button.
 * Supports both controlled and uncontrolled expand/collapse states.
 * Use to organize property panels into logical groups.
 *
 * @example
 * ```tsx
 * import { PropertySection } from "react-editor-ui/PropertySection";
 *
 * <PropertySection title="Transform" collapsible defaultExpanded>
 *   <Input label="X" value={x} onChange={setX} />
 *   <Input label="Y" value={y} onChange={setY} />
 * </PropertySection>
 * ```
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";
import { SectionHeader } from "../SectionHeader/SectionHeader";
import { SPACE_SM, SPACE_MD } from "../../themes/styles";

export type PropertySectionProps = {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  action?: ReactNode;
  contentPadding?: "none" | "sm" | "md";
  className?: string;
};

const paddingMap = {
  none: "0",
  sm: SPACE_SM,
  md: SPACE_MD,
};

export const PropertySection = memo(function PropertySection({
  title,
  children,
  collapsible = false,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onToggle,
  action,
  contentPadding = "sm",
  className,
}: PropertySectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = useCallback(
    (newExpanded: boolean) => {
      if (!isControlled) {
        setInternalExpanded(newExpanded);
      }
      onToggle?.(newExpanded);
    },
    [isControlled, onToggle],
  );

  const contentStyle = useMemo<CSSProperties>(
    () => ({
      padding: `${paddingMap[contentPadding]} ${SPACE_MD}`,
    }),
    [contentPadding],
  );

  const shouldShowContent = !collapsible || isExpanded;

  return (
    <div className={className}>
      <SectionHeader
        title={title}
        collapsible={collapsible}
        expanded={isExpanded}
        onToggle={handleToggle}
        action={action}
      />
      {shouldShowContent ? <div style={contentStyle}>{children}</div> : null}
    </div>
  );
});
