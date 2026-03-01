/**
 * @file ChatInput E2E application entry point
 *
 * Minimal React app for E2E testing of ChatInput component.
 * Includes react-scan for performance monitoring.
 */

import { scan } from "react-scan";
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router";
import "./e2e.css";

// Enable react-scan
scan({
  enabled: true,
  log: true,
  showToolbar: true,
});

// Lazy load mount pages
const ChatInputMount = lazy(() => import("./pages/ChatInputMount"));

/**
 * E2E test application.
 */
const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/chat-input"
          element={
            <Suspense fallback={null}>
              <ChatInputMount />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <div style={{ padding: 20 }}>
              <h1>ChatInput E2E Tests</h1>
              <ul>
                <li><a href="#/chat-input">ChatInput</a></li>
              </ul>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
