/**
 * @file LogViewer demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { LogViewer, type LogItem } from "../../../components/LogViewer/LogViewer";

// Generate large dataset for LogViewer demo
function generateLogItems(count: number): LogItem[] {
  const levels: LogItem["level"][] = ["info", "warning", "error", "debug", "success"];
  const messages = [
    "Application started successfully",
    "Processing request from client",
    "Database connection established",
    "Cache miss, fetching from source",
    "User authentication successful",
    "File upload completed",
    "Background job scheduled",
    "API rate limit approaching",
    "Memory usage above threshold",
    "Unexpected error in handler",
    "Connection timeout occurred",
    "Retrying failed operation",
    "Configuration reloaded",
    "WebSocket connection established",
    "Session expired for user",
  ];
  const sources = [
    "app.tsx",
    "api/handler.ts",
    "db/connection.ts",
    "cache/redis.ts",
    "auth/middleware.ts",
    "upload/processor.ts",
    "jobs/scheduler.ts",
    "api/rateLimit.ts",
    "monitor/memory.ts",
    "error/handler.ts",
  ];

  return Array.from({ length: count }, (_, i) => ({
    message: `${messages[i % messages.length]} [${i + 1}]`,
    level: levels[i % levels.length],
    timestamp: new Date(Date.now() - i * 1000),
    source: `${sources[i % sources.length]}:${(i % 200) + 1}`,
    details: i % 10 === 0 ? `Stack trace or additional details for log entry ${i + 1}` : undefined,
  }));
}

export function LogViewerDemo() {
  const [items] = useState(() => generateLogItems(10000));
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [filterLevel, setFilterLevel] = useState<LogItem["level"] | "all">("all");

  const filter = filterLevel === "all" ? undefined : (item: LogItem) => item.level === filterLevel;

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>LogViewer</h2>
      <p style={{ margin: 0, color: "var(--rei-color-text-muted, #9ba1a6)", fontSize: "12px" }}>
        High-performance log viewer with virtual scrolling. Displaying 10,000 log entries.
      </p>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Virtual Scrolling (10,000 items)</div>
        <div style={{ marginBottom: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "var(--rei-color-text-muted, #9ba1a6)", fontSize: "11px" }}>
            Filter by level:
          </span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogItem["level"] | "all")}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              borderRadius: "4px",
              border: "1px solid var(--rei-color-border, #3a3b3e)",
              backgroundColor: "var(--rei-color-surface, #1e1f24)",
              color: "var(--rei-color-text, #e4e6eb)",
            }}
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <LogViewer
          items={items}
          height={400}
          selectedIndex={selectedIndex}
          onItemClick={(index) => setSelectedIndex(index)}
          filter={filter}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Pagination (100 items per page)</div>
        <LogViewer
          items={items}
          height={300}
          pagination
          pageSize={100}
          page={page}
          onPageChange={setPage}
          selectedIndex={selectedIndex}
          onItemClick={(index) => setSelectedIndex(index)}
        />
      </div>
    </div>
  );
}
