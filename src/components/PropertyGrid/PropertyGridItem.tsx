/**
 * @file PropertyGridItem component - Grid item with span support
 */

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

export function PropertyGridItem({
  children,
  span = 1,
  className,
  ...rest
}: PropertyGridItemProps) {
  const style: CSSProperties = {
    gridColumn: getGridColumn(span),
  };

  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
}
