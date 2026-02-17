/**
 * @file Canvas E2E application entry point
 *
 * Minimal React app for E2E testing of Canvas components.
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
const CanvasMount = lazy(() => import("./pages/CanvasMount"));
const BoundingBoxMount = lazy(() => import("./pages/BoundingBoxMount"));
const GridLayerMount = lazy(() => import("./pages/GridLayerMount"));
const RulerMount = lazy(() => import("./pages/RulerMount"));
const GuideMount = lazy(() => import("./pages/GuideMount"));
const CheckerboardMount = lazy(() => import("./pages/CheckerboardMount"));

/**
 * E2E test application.
 */
const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/canvas"
          element={
            <Suspense fallback={null}>
              <CanvasMount />
            </Suspense>
          }
        />
        <Route
          path="/bounding-box"
          element={
            <Suspense fallback={null}>
              <BoundingBoxMount />
            </Suspense>
          }
        />
        <Route
          path="/grid-layer"
          element={
            <Suspense fallback={null}>
              <GridLayerMount />
            </Suspense>
          }
        />
        <Route
          path="/ruler"
          element={
            <Suspense fallback={null}>
              <RulerMount />
            </Suspense>
          }
        />
        <Route
          path="/guide"
          element={
            <Suspense fallback={null}>
              <GuideMount />
            </Suspense>
          }
        />
        <Route
          path="/checkerboard"
          element={
            <Suspense fallback={null}>
              <CheckerboardMount />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <div style={{ padding: 20 }}>
              <h1>Canvas E2E Tests</h1>
              <ul>
                <li><a href="#/canvas">Canvas</a></li>
                <li><a href="#/bounding-box">BoundingBox</a></li>
                <li><a href="#/grid-layer">GridLayer</a></li>
                <li><a href="#/ruler">Ruler</a></li>
                <li><a href="#/guide">Guide</a></li>
                <li><a href="#/checkerboard">Checkerboard</a></li>
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
