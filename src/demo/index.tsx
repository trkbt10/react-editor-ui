/**
 * @file Demo application entry point with React Router
 */

import { scan } from "react-scan";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Outlet, Navigate } from "react-router";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { demoCategories, type DemoPage } from "./routes";
import "./demo.css";

// Enable react-scan in development
if (import.meta.env.DEV) {
  scan({
    enabled: true,
    log: true,
    showToolbar: true,
  });
}

const CategoryOutlet = () => <Outlet />;

/**
 * Recursively renders route for a page, handling nested children
 */
const renderPageRoute = (page: DemoPage) => {
  if (page.children && page.children.length > 0) {
    return (
      <Route
        key={page.id}
        path={page.path}
        element={<Suspense fallback={null}>{page.element}</Suspense>}
      >
        {page.indexRedirect && (
          <Route index element={<Navigate to={page.indexRedirect} replace />} />
        )}
        {page.children.map(renderPageRoute)}
      </Route>
    );
  }

  return (
    <Route
      key={page.id}
      path={page.path}
      element={<Suspense fallback={null}>{page.element}</Suspense>}
    />
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {demoCategories.map((category) => (
            <Route
              key={category.id}
              path={category.base.slice(1)}
              element={<CategoryOutlet />}
            >
              {category.pages.map(renderPageRoute)}
            </Route>
          ))}
        </Route>
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
