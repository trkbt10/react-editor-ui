/**
 * @file PropertySection component - Section wrapper with collapsible header
 */

import { useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import { SectionHeader } from "../SectionHeader/SectionHeader";
import { SPACE_SM, SPACE_MD } from "../../constants/styles";

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

export function PropertySection({
  title,
  children,
  collapsible = false,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onToggle,
  action,
  contentPadding = "md",
  className,
}: PropertySectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = (newExpanded: boolean) => {
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onToggle?.(newExpanded);
  };

  const contentStyle: CSSProperties = {
    padding: `${paddingMap[contentPadding]} ${SPACE_MD}`,
  };

  const renderContent = () => {
    if (collapsible && !isExpanded) {
      return null;
    }
    return <div style={contentStyle}>{children}</div>;
  };

  return (
    <div className={className}>
      <SectionHeader
        title={title}
        collapsible={collapsible}
        expanded={isExpanded}
        onToggle={handleToggle}
        action={action}
      />
      {renderContent()}
    </div>
  );
}
