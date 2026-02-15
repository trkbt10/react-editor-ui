/**
 * @file Main layout component using react-panel-layout GridLayout
 * Design matches react-panel-layout demo style
 */

import type { FC, CSSProperties } from "react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  GridLayout,
  type PanelLayoutConfig,
  type LayerDefinition,
} from "react-panel-layout";
import { demoCategories } from "./routes";

const styles = {
  sidebar: {
    height: "100%",
    background: "var(--rei-demo-sidebar-bg)",
    color: "var(--rei-demo-text-primary)",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    borderRight: "1px solid var(--rei-demo-sidebar-border)",
    fontFamily: "var(--rei-demo-font-family)",
    fontSize: "var(--rei-demo-font-size-sm)",
  } satisfies CSSProperties,
  sidebarHeader: {
    padding: "var(--rei-demo-space-lg) var(--rei-demo-space-lg) var(--rei-demo-space-md)",
    borderBottom: "none",
    marginBottom: "var(--rei-demo-space-sm)",
  } satisfies CSSProperties,
  sidebarTitle: {
    margin: 0,
    fontSize: "var(--rei-demo-font-size-lg)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--rei-demo-text-primary)",
    background: "var(--rei-demo-gradient-text)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
  } satisfies CSSProperties,
  sidebarSubtitle: {
    margin: "4px 0 0",
    fontSize: "var(--rei-demo-font-size-xs)",
    color: "var(--rei-demo-text-secondary)",
    fontWeight: 500,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    opacity: 0.8,
  } satisfies CSSProperties,
  nav: {
    flex: 1,
    padding: "0 var(--rei-demo-space-md)",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  } satisfies CSSProperties,
  navCategory: {
    margin: "4px 0",
  } satisfies CSSProperties,
  navCategorySummary: {
    padding: "8px 12px",
    fontSize: "var(--rei-demo-font-size-sm)",
    fontWeight: 600,
    color: "var(--rei-demo-text-secondary)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    listStyle: "none",
    borderRadius: "var(--rei-demo-radius-md)",
    transition: "var(--rei-demo-transition)",
  } satisfies CSSProperties,
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    color: "var(--rei-demo-text-secondary)",
    textDecoration: "none",
    fontSize: "var(--rei-demo-font-size-sm)",
    background: "transparent",
    borderRadius: "var(--rei-demo-radius-md)",
    transition: "var(--rei-demo-transition)",
    fontWeight: 500,
  } satisfies CSSProperties,
  navLinkActive: {
    background: "rgba(0, 122, 255, 0.08)",
    color: "var(--rei-demo-color-primary)",
    fontWeight: 600,
  } satisfies CSSProperties,
  navChildLink: {
    display: "block",
    padding: "8px 12px 8px 40px",
    color: "var(--rei-demo-text-secondary)",
    textDecoration: "none",
    fontSize: "var(--rei-demo-font-size-sm)",
    background: "transparent",
    borderRadius: "var(--rei-demo-radius-md)",
    transition: "var(--rei-demo-transition)",
    fontWeight: 400,
  } satisfies CSSProperties,
  sidebarFooter: {
    padding: "var(--rei-demo-space-lg)",
    borderTop: "1px solid var(--rei-demo-sidebar-border)",
    fontSize: "var(--rei-demo-font-size-xs)",
    color: "var(--rei-demo-text-tertiary)",
    textAlign: "center",
  } satisfies CSSProperties,
  mobileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "var(--rei-demo-space-sm)",
    padding: "var(--rei-demo-space-sm) var(--rei-demo-space-md)",
    borderBottom: "1px solid var(--rei-demo-sidebar-border)",
    background: "var(--rei-demo-bg)",
  } satisfies CSSProperties,
  mobileNavButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid var(--rei-demo-sidebar-border)",
    borderRadius: "var(--rei-demo-radius-md)",
    padding: "8px 12px",
    background: "var(--rei-demo-control-bg)",
    color: "var(--rei-demo-text-primary)",
    cursor: "pointer",
    fontSize: "var(--rei-demo-font-size-sm)",
    fontWeight: 600,
    transition: "var(--rei-demo-transition)",
  } satisfies CSSProperties,
  navArrow: {
    color: "var(--rei-demo-text-tertiary)",
    transition: "transform 0.2s ease",
    fontSize: "12px",
  } satisfies CSSProperties,
};

const SidebarNav: FC = () => {
  const location = useLocation();
  const topLinks = [{ path: "/", label: "Home" }] as const;

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h2 style={styles.sidebarTitle}>React Editor UI</h2>
        <p style={styles.sidebarSubtitle}>Component Library</p>
      </div>
      <nav style={styles.nav}>
        {topLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              }}
            >
              {item.label}
            </Link>
          );
        })}

        {demoCategories.map((category) => {
          const isOpen = location.pathname.startsWith(category.base);
          return (
            <details
              key={category.id}
              style={styles.navCategory}
              open={isOpen}
            >
              <summary style={styles.navCategorySummary}>
                <span style={{ flex: 1 }}>{category.label}</span>
                <span style={styles.navArrow}>▸</span>
              </summary>
              <div style={{ marginTop: "2px" }}>
                {category.pages.map((page) => {
                  const fullPath = `${category.base}/${page.path}`;
                  const isPageActive = location.pathname === fullPath;
                  return (
                    <Link
                      key={page.id}
                      to={fullPath}
                      style={{
                        ...styles.navChildLink,
                        ...(isPageActive ? styles.navLinkActive : {}),
                      }}
                    >
                      {page.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </nav>
      <div style={styles.sidebarFooter}>v{__APP_VERSION__}</div>
    </div>
  );
};

const MobileHeader: FC<{ onOpenNav: () => void }> = ({ onOpenNav }) => {
  return (
    <div style={styles.mobileHeader}>
      <button
        type="button"
        style={styles.mobileNavButton}
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        ☰ Menu
      </button>
      <h2
        style={{
          margin: 0,
          fontSize: "var(--rei-demo-font-size-lg)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        React Editor UI
      </h2>
    </div>
  );
};

const StackedMainContent: FC<{ onOpenNav: () => void }> = ({ onOpenNav }) => {
  return (
    <div
      style={{
        background: "var(--rei-demo-bg)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <MobileHeader onOpenNav={onOpenNav} />
      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
};

export const Layout: FC = () => {
  const [isStackedLayout, setIsStackedLayout] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const handleOpenNav = useCallback(() => setNavOpen(true), []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 960px)");
    setIsStackedLayout(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsStackedLayout(e.matches);
      if (!e.matches) {
        setNavOpen(false);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const config = useMemo<PanelLayoutConfig>(() => {
    if (isStackedLayout) {
      return {
        areas: [["main"]],
        columns: [{ size: "1fr" }],
        rows: [{ size: "1fr" }],
      };
    }

    return {
      areas: [["sidebar", "main"]],
      columns: [
        { size: "250px", resizable: true, minSize: 200, maxSize: 400 },
        { size: "1fr" },
      ],
      rows: [{ size: "minmax(0, 100vh)" }],
    };
  }, [isStackedLayout]);

  const layers = useMemo<LayerDefinition[]>(() => {
    if (isStackedLayout) {
      return [
        {
          id: "main",
          gridArea: "main",
          component: <StackedMainContent onOpenNav={handleOpenNav} />,
        },
        {
          id: "sidebar-drawer",
          component: <SidebarNav />,
          drawer: {
            open: navOpen,
            onStateChange: setNavOpen,
            dismissible: true,
            ariaLabel: "Navigation",
            header: { title: "Navigation", showCloseButton: true },
            transitionMode: "css",
          },
          width: 320,
          position: { left: 0 },
          zIndex: 10000,
        },
      ];
    }

    return [
      {
        id: "sidebar",
        gridArea: "sidebar",
        component: <SidebarNav />,
        scrollable: true,
      },
      {
        id: "main",
        gridArea: "main",
        component: <Outlet />,
        scrollable: true,
      },
    ];
  }, [handleOpenNav, isStackedLayout, navOpen]);

  return <GridLayout config={config} layers={layers} root />;
};
