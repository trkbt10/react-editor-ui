/**
 * @file Editor E2E application entry point
 *
 * Minimal React app for E2E testing of Editor components.
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
const TextEditorMount = lazy(() => import("./pages/TextEditorMount"));
const CodeEditorMount = lazy(() => import("./pages/CodeEditorMount"));
const TextEditorPerfMount = lazy(() => import("./pages/TextEditorPerfMount"));
const TextEditorCanvasMount = lazy(() => import("./pages/TextEditorCanvasMount"));

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/text-editor"
          element={
            <Suspense fallback={null}>
              <TextEditorMount />
            </Suspense>
          }
        />
        <Route
          path="/code-editor"
          element={
            <Suspense fallback={null}>
              <CodeEditorMount />
            </Suspense>
          }
        />
        <Route
          path="/text-editor-perf"
          element={
            <Suspense fallback={null}>
              <TextEditorPerfMount />
            </Suspense>
          }
        />
        <Route
          path="/text-editor-canvas"
          element={
            <Suspense fallback={null}>
              <TextEditorCanvasMount />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <div style={{ padding: 20 }}>
              <h1>Editor E2E Tests</h1>
              <ul>
                <li><a href="#/text-editor">TextEditor</a></li>
                <li><a href="#/code-editor">CodeEditor</a></li>
                <li><a href="#/text-editor-perf">TextEditor Performance (50 lines)</a></li>
                <li><a href="#/text-editor-canvas">TextEditor Canvas</a></li>
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
