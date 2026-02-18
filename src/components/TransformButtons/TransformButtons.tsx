/**
 * @file TransformButtons component - Flexible transform operation buttons
 *
 * @description
 * A grouped toolbar for transform operations like rotate, flip, align, and distribute.
 * Actions are organized into groups separated by dividers. Each button has a tooltip.
 * Fully customizable via the actions array for any transform workflow.
 *
 * @example
 * ```tsx
 * import { TransformButtons } from "react-editor-ui/TransformButtons";
 *
 * <TransformButtons
 *   groups={[
 *     {
 *       id: "rotate",
 *       actions: [
 *         { id: "rotate-cw", icon: <RotateCwIcon />, label: "Rotate 90° right" },
 *         { id: "rotate-ccw", icon: <RotateCcwIcon />, label: "Rotate 90° left" },
 *       ],
 *     },
 *   ]}
 *   onAction={(id) => console.log(id)}
 * />
 * ```
 */

import { memo, useMemo, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";
import { Tooltip } from "../Tooltip/Tooltip";
import { IconButton } from "../IconButton/IconButton";
import { ToolbarGroup } from "../Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../Toolbar/ToolbarDivider";
import { SPACE_XS } from "../../themes/styles";

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

type TransformActionButtonProps = {
  action: TransformAction;
  size: "sm" | "md" | "lg";
  disabled: boolean;
  onAction: (actionId: string) => void;
};

const TransformActionButton = memo(function TransformActionButton({
  action,
  size,
  disabled,
  onAction,
}: TransformActionButtonProps) {
  const handleClick = useCallback(() => {
    onAction(action.id);
  }, [onAction, action.id]);

  return (
    <Tooltip content={action.label}>
      <IconButton
        icon={action.icon}
        aria-label={action.label}
        size={size}
        disabled={disabled || action.disabled}
        onClick={handleClick}
      />
    </Tooltip>
  );
});

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
export const TransformButtons = memo(function TransformButtons({
  groups,
  onAction,
  disabled = false,
  size = "md",
  className,
}: TransformButtonsProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_XS,
    }),
    [],
  );

  const contentsStyle = useMemo<CSSProperties>(
    () => ({ display: "contents" }),
    [],
  );

  const nonEmptyGroups = useMemo(
    () => groups.filter((group) => group.actions.length > 0),
    [groups],
  );

  return (
    <div className={className} style={containerStyle}>
      {nonEmptyGroups.map((group, groupIndex) => (
        <span key={group.id} style={contentsStyle}>
          <ToolbarGroup>
            {group.actions.map((action) => (
              <TransformActionButton
                key={action.id}
                action={action}
                size={size}
                disabled={disabled}
                onAction={onAction}
              />
            ))}
          </ToolbarGroup>
          {groupIndex < nonEmptyGroups.length - 1 ? <ToolbarDivider /> : null}
        </span>
      ))}
    </div>
  );
});
