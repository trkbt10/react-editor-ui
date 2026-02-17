/**
 * @file Base component for selectable font list items with check indicator
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon } from "../../icons";
import {
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_PRIMARY,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

export type FontListItemBaseProps = {
  isSelected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

function createItemStyle(isSelected: boolean, isHovered: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: SPACE_MD,
    padding: `${SPACE_SM} ${SPACE_LG}`,
    backgroundColor: isSelected ? COLOR_SELECTED : isHovered ? COLOR_HOVER : "transparent",
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };
}

function createCheckboxStyle(isSelected: boolean): CSSProperties {
  return {
    width: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isSelected ? COLOR_PRIMARY : "transparent",
    flexShrink: 0,
  };
}

/** Base list item with check indicator and hover state */
export function FontListItemBase({
  isSelected,
  onSelect,
  children,
}: FontListItemBaseProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={createItemStyle(isSelected, isHovered)}
    >
      <span style={createCheckboxStyle(isSelected)}>
        {isSelected ? <CheckIcon size="sm" /> : null}
      </span>
      {children}
    </div>
  );
}
