/**
 * @file Demo home page with bento grid layout
 * Design matches react-panel-layout demo style
 */

import type { FC, CSSProperties } from "react";
import { Link } from "react-router";
import { demoCategories } from "../routes";
import { DemoButton, DemoCard } from "../components/ui";
import { CodeBlock } from "../components/CodeBlock";
import { useMedia } from "../hooks/useMedia";
import {
  LuBox,
  LuMoon,
  LuCode,
  LuLayoutGrid,
  LuArrowRight,
} from "react-icons/lu";

const QUICK_START_CODE = `import { Button, Input, Panel } from 'react-editor-ui';

function App() {
  return (
    <Panel title="My Panel">
      <Input placeholder="Enter text..." />
      <Button variant="primary">Submit</Button>
    </Panel>
  );
}`;

const styles = {
  container: {
    background: "var(--rei-demo-gradient-hero)",
    padding: "var(--rei-demo-space-xxl) var(--rei-demo-space-lg)",
    fontFamily: "var(--rei-demo-font-family)",
    color: "var(--rei-demo-text-primary)",
    minHeight: "100%",
  } satisfies CSSProperties,
  containerMobile: {
    padding: "var(--rei-demo-space-xl) var(--rei-demo-space-md)",
  } satisfies CSSProperties,
  hero: {
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
    marginBottom: "var(--rei-demo-space-xxl)",
    position: "relative",
  } satisfies CSSProperties,
  heroMobile: {
    marginBottom: "var(--rei-demo-space-xl)",
  } satisfies CSSProperties,
  heroGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "400px",
    background: "var(--rei-demo-gradient-glow)",
    pointerEvents: "none",
    zIndex: 0,
  } satisfies CSSProperties,
  heroGlowMobile: {
    width: "360px",
    height: "260px",
  } satisfies CSSProperties,
  heroContent: {
    position: "relative",
    zIndex: 1,
  } satisfies CSSProperties,
  versionBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    background: "rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    fontSize: "var(--rei-demo-font-size-sm)",
    fontWeight: 600,
    marginBottom: "var(--rei-demo-space-lg)",
    border: "1px solid rgba(0,0,0,0.05)",
  } satisfies CSSProperties,
  title: {
    fontSize: "var(--rei-demo-font-size-display)",
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    marginBottom: "var(--rei-demo-space-lg)",
    background: "var(--rei-demo-gradient-text)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  } satisfies CSSProperties,
  titleMobile: {
    fontSize: "var(--rei-demo-font-size-display-sm)",
  } satisfies CSSProperties,
  subtitle: {
    fontSize: "var(--rei-demo-font-size-lg)",
    lineHeight: 1.5,
    color: "var(--rei-demo-text-secondary)",
    maxWidth: "640px",
    margin: "0 auto var(--rei-demo-space-xl)",
  } satisfies CSSProperties,
  subtitleMobile: {
    fontSize: "var(--rei-demo-font-size-md)",
    maxWidth: "100%",
  } satisfies CSSProperties,
  heroActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  } satisfies CSSProperties,
  grid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridAutoRows: "minmax(200px, auto)",
    gap: "var(--rei-demo-space-lg)",
  } satisfies CSSProperties,
  gridMedium: {
    gridTemplateColumns: "repeat(2, 1fr)",
  } satisfies CSSProperties,
  gridMobile: {
    gridTemplateColumns: "1fr",
  } satisfies CSSProperties,
  wideCard: {
    gridColumn: "span 2",
  } satisfies CSSProperties,
  wideCardMobile: {
    gridColumn: "span 1",
  } satisfies CSSProperties,
  cardTitle: {
    fontSize: "24px",
    fontWeight: 700,
    margin: "0 0 8px",
    color: "var(--rei-demo-text-primary)",
  } satisfies CSSProperties,
  cardDescription: {
    fontSize: "16px",
    color: "var(--rei-demo-text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  } satisfies CSSProperties,
  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(0, 113, 227, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--rei-demo-color-primary)",
    marginBottom: "16px",
  } satisfies CSSProperties,
  darkCard: {
    background: "#1d1d1f",
    color: "#fff",
  } satisfies CSSProperties,
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    marginTop: "16px",
  } satisfies CSSProperties,
  categoryLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    background: "rgba(0, 0, 0, 0.03)",
    borderRadius: "8px",
    color: "var(--rei-demo-text-secondary)",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 500,
    transition: "all 0.2s ease",
  } satisfies CSSProperties,
  statsRow: {
    display: "flex",
    gap: "24px",
    marginTop: "16px",
  } satisfies CSSProperties,
  statItem: {
    textAlign: "center",
  } satisfies CSSProperties,
  statNumber: {
    fontSize: "32px",
    fontWeight: 700,
    color: "var(--rei-demo-color-primary)",
  } satisfies CSSProperties,
  statLabel: {
    fontSize: "12px",
    color: "var(--rei-demo-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  } satisfies CSSProperties,
};

export const Home: FC = () => {
  const isMediumViewport = useMedia("(max-width: 1200px)");
  const isSmallViewport = useMedia("(max-width: 720px)");

  // Calculate total components
  const totalComponents = demoCategories.reduce(
    (sum, cat) => sum + cat.pages.length,
    0,
  );

  const containerStyle: CSSProperties = {
    ...styles.container,
    ...(isSmallViewport ? styles.containerMobile : {}),
  };

  const heroStyle: CSSProperties = {
    ...styles.hero,
    ...(isSmallViewport ? styles.heroMobile : {}),
  };

  const heroGlowStyle: CSSProperties = {
    ...styles.heroGlow,
    ...(isSmallViewport ? styles.heroGlowMobile : {}),
  };

  const titleStyle: CSSProperties = {
    ...styles.title,
    ...(isSmallViewport ? styles.titleMobile : {}),
  };

  const subtitleStyle: CSSProperties = {
    ...styles.subtitle,
    ...(isSmallViewport ? styles.subtitleMobile : {}),
  };

  const gridStyle: CSSProperties = {
    ...styles.grid,
    ...(isMediumViewport ? styles.gridMedium : {}),
    ...(isSmallViewport ? styles.gridMobile : {}),
  };

  const wideCardStyle: CSSProperties = isSmallViewport
    ? styles.wideCardMobile
    : styles.wideCard;

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={heroGlowStyle} />
        <div style={styles.heroContent}>
          <div style={styles.versionBadge}>{__APP_VERSION__}</div>
          <h1 style={titleStyle}>
            React Editor UI
            <br />
            Component Library
          </h1>
          <p style={subtitleStyle}>
            A complete set of UI components for building professional editor
            applications. Designed for Figma-like interfaces.
          </p>
          <div style={styles.heroActions}>
            <Link
              to="/components/primitives/icon-button"
              style={{ textDecoration: "none" }}
            >
              <DemoButton variant="primary" size="lg">
                Get Started
                <LuArrowRight style={{ marginLeft: "8px" }} />
              </DemoButton>
            </Link>
            <a
              href="#categories"
              style={{ textDecoration: "none" }}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("categories")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <DemoButton variant="secondary" size="lg">
                Browse Components
              </DemoButton>
            </a>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div style={gridStyle}>
        {/* Card 1: Component Stats (Wide) */}
        <DemoCard
          hoverEffect
          style={{
            ...wideCardStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle at 100% 0%, rgba(0,113,227,0.08) 0%, transparent 70%)",
            }}
          />
          <div>
            <div style={styles.cardIcon}>
              <LuBox size={24} />
            </div>
            <h3 style={styles.cardTitle}>{totalComponents}+ Components</h3>
            <p style={styles.cardDescription}>
              From basic inputs to complex editor panels. Everything you need
              for professional design tools.
            </p>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{demoCategories.length}</div>
              <div style={styles.statLabel}>Categories</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>100%</div>
              <div style={styles.statLabel}>TypeScript</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>3</div>
              <div style={styles.statLabel}>Themes</div>
            </div>
          </div>
        </DemoCard>

        {/* Card 2: Dark Theme */}
        <DemoCard
          hoverEffect
          style={{
            ...styles.darkCard,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <LuMoon size={28} color="#fff" />
          </div>
          <h3 style={{ ...styles.cardTitle, color: "#fff" }}>
            Dark Theme Ready
          </h3>
          <p style={{ ...styles.cardDescription, color: "rgba(255,255,255,0.7)" }}>
            Built-in support for light, dark, and high contrast themes.
          </p>
        </DemoCard>

        {/* Card 3: TypeScript */}
        <DemoCard
          hoverEffect
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={styles.cardIcon}>
            <LuCode size={24} />
          </div>
          <h3 style={styles.cardTitle}>TypeScript First</h3>
          <p style={styles.cardDescription}>
            Full type safety with comprehensive TypeScript definitions.
          </p>
        </DemoCard>

        {/* Card 4: Code Preview (Wide) */}
        <DemoCard
          hoverEffect
          style={{
            ...wideCardStyle,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ ...styles.cardTitle, marginBottom: "16px" }}>
            Quick Start
          </h3>
          <CodeBlock code={QUICK_START_CODE} title="App.tsx" />
        </DemoCard>

        {/* Card 5: Panel Integration */}
        <DemoCard
          hoverEffect
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={styles.cardIcon}>
            <LuLayoutGrid size={24} />
          </div>
          <h3 style={styles.cardTitle}>Panel Integration</h3>
          <p style={styles.cardDescription}>
            Works seamlessly with react-panel-layout for complex interfaces.
          </p>
        </DemoCard>

        {/* Card 6: Browse Categories */}
        <DemoCard
          id="categories"
          hoverEffect
          style={{
            ...wideCardStyle,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={styles.cardTitle}>Browse Categories</h3>
          <p style={styles.cardDescription}>
            Explore all {totalComponents} components organized by type.
          </p>
          <div style={styles.categoryGrid}>
            {demoCategories.map((category) => {
              const firstPage = category.pages[0];
              const href = `${category.base}/${firstPage?.path ?? ""}`;
              return (
                <Link key={category.id} to={href} style={styles.categoryLink}>
                  {category.icon}
                  <span>{category.label}</span>
                  <span style={{ marginLeft: "auto", opacity: 0.5 }}>
                    {category.pages.length}
                  </span>
                </Link>
              );
            })}
          </div>
        </DemoCard>
      </div>
    </div>
  );
};
