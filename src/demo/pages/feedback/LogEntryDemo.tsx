/**
 * @file LogEntry demo page
 */

import {
  DemoContainer,
  DemoSection,
  DemoSurface,
} from "../../components";
import { LogEntry } from "../../../components/LogEntry/LogEntry";

export function LogEntryDemo() {
  return (
    <DemoContainer title="LogEntry">
      <DemoSection label="Log Levels">
        <DemoSurface>
          <LogEntry message="Application started" level="info" timestamp={new Date()} />
          <LogEntry message="Component re-rendered" level="debug" timestamp={new Date()} />
          <LogEntry message="Build completed successfully" level="success" timestamp={new Date()} />
          <LogEntry message="Deprecated API usage" level="warning" timestamp={new Date()} />
          <LogEntry message="Failed to connect" level="error" timestamp={new Date()} />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="With Source and Details">
        <DemoSurface>
          <LogEntry
            message="Uncaught TypeError"
            level="error"
            timestamp={new Date()}
            source="app.tsx:42"
            details="Cannot read property 'foo' of undefined\n  at handleClick (app.tsx:42)\n  at HTMLButtonElement.onclick"
          />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Selected State">
        <DemoSurface>
          <LogEntry message="Selected log entry" level="info" selected />
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
