/**
 * @file TransformButtons component - Flexible transform operation buttons
 * Provides rotate, flip, align, distribute and custom operations via actions array
 */

import type { ReactNode, CSSProperties } from "react";
import { Tooltip } from "../Tooltip/Tooltip";
import { IconButton } from "../IconButton/IconButton";
import { ToolbarGroup } from "../Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../Toolbar/ToolbarDivider";
import { SPACE_XS } from "../../constants/styles";

export type TransformAction = {
  /** Unique identifier for the action */
  id: string;
  /** Icon to display */
  icon: ReactNode;
  /** Tooltip label */
  label: string;
  /** Whether this action is disabled */
  disabled?: boolean;
};

export type TransformActionGroup = {
  /** Group identifier */
  id: string;
  /** Actions in this group */
  actions: TransformAction[];
};

export type TransformButtonsProps = {
  /** Action groups to display - each group is separated by a divider */
  groups: TransformActionGroup[];
  /** Callback when an action is triggered */
  onAction: (actionId: string) => void;
  /** Disable all buttons */
  disabled?: boolean;
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
};

/**
 * TransformButtons displays groups of icon buttons with tooltips.
 * Each group is separated by a divider.
 *
 * @example
 * ```tsx
 * <TransformButtons
 *   groups={[
 *     {
 *       id: "rotate",
 *       actions: [
 *         { id: "rotate-cw", icon: <LuRotateCw />, label: "Rotate 90° right" },
 *         { id: "rotate-ccw", icon: <LuRotateCcw />, label: "Rotate 90° left" },
 *       ],
 *     },
 *     {
 *       id: "flip",
 *       actions: [
 *         { id: "flip-h", icon: <LuFlipHorizontal />, label: "Flip horizontal" },
 *       ],
 *     },
 *   ]}
 *   onAction={(id) => console.log(id)}
 * />
 * ```
 */
export function TransformButtons({
  groups,
  onAction,
  disabled = false,
  size = "md",
  className,
}: TransformButtonsProps) {
  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_XS,
  };

  const nonEmptyGroups = groups.filter((group) => group.actions.length > 0);

  return (
    <div className={className} style={containerStyle}>
      {nonEmptyGroups.map((group, groupIndex) => (
        <span key={group.id} style={{ display: "contents" }}>
          <ToolbarGroup>
            {group.actions.map((action) => (
              <Tooltip key={action.id} content={action.label}>
                <IconButton
                  icon={action.icon}
                  aria-label={action.label}
                  size={size}
                  disabled={disabled || action.disabled}
                  onClick={() => onAction(action.id)}
                />
              </Tooltip>
            ))}
          </ToolbarGroup>
          {groupIndex < nonEmptyGroups.length - 1 ? <ToolbarDivider /> : null}
        </span>
      ))}
    </div>
  );
}
