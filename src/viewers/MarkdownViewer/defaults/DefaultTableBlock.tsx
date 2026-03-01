/**
 * @file DefaultTableBlock renderer
 */

import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import type { TableBlockProps } from "../types";
import { tableStyle, thStyle, tdStyle, codeBlockStyle } from "../styles";

const alignToTextAlign = (
  a: "left" | "center" | "right" | undefined,
): CSSProperties["textAlign"] => a ?? "left";

export const DefaultTableBlock = memo(function DefaultTableBlock({
  block,
  parsed,
}: TableBlockProps) {
  const table = useMemo(() => {
    if (!parsed) {
      return <pre style={codeBlockStyle}>{block.content}</pre>;
    }
    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            {parsed.headers.map((h, i) => (
              <th
                key={i}
                style={{
                  ...thStyle,
                  textAlign: alignToTextAlign(parsed.alignments[i]),
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    ...tdStyle,
                    textAlign: alignToTextAlign(parsed.alignments[ci]),
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }, [block.content, parsed]);

  return table;
});
