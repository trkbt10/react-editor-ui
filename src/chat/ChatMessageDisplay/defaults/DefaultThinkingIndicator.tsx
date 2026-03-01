/**
 * @file DefaultThinkingIndicator - Default thinking/loading indicator
 */

import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import type { ThinkingIndicatorProps } from "../types";
import {
  COLOR_SURFACE_RAISED,
  COLOR_TEXT_MUTED,
  RADIUS_LG,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
} from "../../../themes/styles";

const baseStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  padding: `${SPACE_SM} 0`,
};

const bubbleStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE_RAISED,
  color: COLOR_TEXT_MUTED,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  borderRadius: RADIUS_LG,
  fontSize: SIZE_FONT_SM,
  display: "flex",
  gap: "4px",
};

const dotStyle: CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "currentColor",
  animation: "thinking-pulse 1.4s infinite ease-in-out",
};

export const DefaultThinkingIndicator = memo(function DefaultThinkingIndicator(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- props reserved for future customization
  _props: ThinkingIndicatorProps,
) {
  const dots = useMemo(
    () =>
      [0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            ...dotStyle,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      )),
    [],
  );

  return (
    <div style={baseStyle}>
      <div style={bubbleStyle}>
        {dots}
        <style>{`
          @keyframes thinking-pulse {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
});
