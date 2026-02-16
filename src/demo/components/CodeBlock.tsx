/**
 * @file Code display component with copy functionality
 */

import type { FC, CSSProperties } from "react";
import { useState, useCallback } from "react";

export type CodeBlockProps = {
  code: string;
  title?: string;
  language?: string;
};

const styles = {
  container: {
    background: "#1d1d1f",
    borderRadius: "var(--rei-demo-radius-md)",
    overflow: "hidden",
    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  } satisfies CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  } satisfies CSSProperties,
  title: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "12px",
    fontWeight: 500,
  } satisfies CSSProperties,
  copyButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "11px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  } satisfies CSSProperties,
  copyButtonHover: {
    background: "rgba(255, 255, 255, 0.2)",
  } satisfies CSSProperties,
  copyButtonSuccess: {
    background: "rgba(52, 199, 89, 0.3)",
    color: "#34c759",
  } satisfies CSSProperties,
  content: {
    padding: "16px",
    margin: 0,
    overflow: "auto",
    maxHeight: "400px",
  } satisfies CSSProperties,
  code: {
    color: "#f8f8f2",
    fontSize: "13px",
    lineHeight: 1.6,
    whiteSpace: "pre",
    margin: 0,
    fontFamily: "inherit",
  } satisfies CSSProperties,
};

export const CodeBlock: FC<CodeBlockProps> = ({
  code,
  title = "Code",
  language = "typescript",
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const buttonStyle: CSSProperties = {
    ...styles.copyButton,
    ...(isHovered && !copied ? styles.copyButtonHover : {}),
    ...(copied ? styles.copyButtonSuccess : {}),
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>
          {title}
          {language && ` (${language})`}
        </span>
        <button
          type="button"
          style={buttonStyle}
          onClick={handleCopy}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={styles.content}>
        <code style={styles.code}>{code}</code>
      </pre>
    </div>
  );
};
