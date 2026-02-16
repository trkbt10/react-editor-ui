/**
 * @file PropertyGridItem component - Grid item with span support
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties, HTMLAttributes } from "react";

export type PropertyGridItemProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | "full";
  className?: string;
};

function getGridColumn(span: 1 | 2 | 3 | 4 | "full"): string {
  if (span === "full") {
    return "1 / -1";
  }
  return `span ${span}`;
}

/** Grid cell item that can span 1-4 columns for property row layouts */
export const PropertyGridItem = memo(function PropertyGridItem({
  children,
  span = 1,
  className,
  ...rest
}: PropertyGridItemProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      gridColumn: getGridColumn(span),
      minWidth: 0,
      boxSizing: "border-box",
    }),
    [span],
  );

  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
});
