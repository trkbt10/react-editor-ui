/**
 * @file PropertyGrid component - Grid layout for property panels
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties, HTMLAttributes } from "react";
import { SPACE_SM, SPACE_MD, SPACE_LG } from "../../constants/styles";

export type PropertyGridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
};

const gapMap = {
  sm: SPACE_SM,
  md: SPACE_MD,
  lg: SPACE_LG,
};

export const PropertyGrid = memo(function PropertyGrid({
  children,
  columns = 2,
  gap = "sm",
  className,
  ...rest
}: PropertyGridProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gapMap[gap],
    }),
    [columns, gap],
  );

  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
});
