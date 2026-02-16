/**
 * @file LogEntry demo page
 */

import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { LogEntry } from "../../../components/LogEntry/LogEntry";

export function LogEntryDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>LogEntry</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Log Levels</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <LogEntry message="Application started" level="info" timestamp={new Date()} />
          <LogEntry message="Component re-rendered" level="debug" timestamp={new Date()} />
          <LogEntry message="Build completed successfully" level="success" timestamp={new Date()} />
          <LogEntry message="Deprecated API usage" level="warning" timestamp={new Date()} />
          <LogEntry message="Failed to connect" level="error" timestamp={new Date()} />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Source and Details</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <LogEntry
            message="Uncaught TypeError"
            level="error"
            timestamp={new Date()}
            source="app.tsx:42"
            details="Cannot read property 'foo' of undefined\n  at handleClick (app.tsx:42)\n  at HTMLButtonElement.onclick"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Selected State</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <LogEntry message="Selected log entry" level="info" selected />
        </div>
      </div>
    </div>
  );
}
