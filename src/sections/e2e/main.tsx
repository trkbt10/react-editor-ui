/**
 * @file Sections E2E application entry point
 *
 * Minimal React app for E2E testing of Section components.
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
const AlignmentMount = lazy(() => import("./pages/AlignmentMount"));
const PositionMount = lazy(() => import("./pages/PositionMount"));
const SizeMount = lazy(() => import("./pages/SizeMount"));
const RotationMount = lazy(() => import("./pages/RotationMount"));
const ConstraintsMount = lazy(() => import("./pages/ConstraintsMount"));

/**
 * E2E test application.
 */
const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/alignment"
          element={
            <Suspense fallback={null}>
              <AlignmentMount />
            </Suspense>
          }
        />
        <Route
          path="/position"
          element={
            <Suspense fallback={null}>
              <PositionMount />
            </Suspense>
          }
        />
        <Route
          path="/size"
          element={
            <Suspense fallback={null}>
              <SizeMount />
            </Suspense>
          }
        />
        <Route
          path="/rotation"
          element={
            <Suspense fallback={null}>
              <RotationMount />
            </Suspense>
          }
        />
        <Route
          path="/constraints"
          element={
            <Suspense fallback={null}>
              <ConstraintsMount />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <div style={{ padding: 20 }}>
              <h1>Sections E2E Tests</h1>
              <ul>
                <li><a href="#/alignment">AlignmentSection</a></li>
                <li><a href="#/position">PositionSection</a></li>
                <li><a href="#/size">SizeSection</a></li>
                <li><a href="#/rotation">RotationSection</a></li>
                <li><a href="#/constraints">ConstraintsSection</a></li>
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
