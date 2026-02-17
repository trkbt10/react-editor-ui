/**
 * @file LibraryBrowser E2E application entry point
 *
 * Minimal React app for E2E testing of LibraryBrowser components.
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
const LibraryBrowserMount = lazy(() => import("./pages/LibraryBrowserMount"));

/**
 * E2E test application.
 */
const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/library-browser"
          element={
            <Suspense fallback={null}>
              <LibraryBrowserMount />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <div style={{ padding: 20 }}>
              <h1>LibraryBrowser E2E Tests</h1>
              <ul>
                <li><a href="#/library-browser">LibraryBrowser</a></li>
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
