/**
 * @file Demo home page
 * Design matches react-panel-layout demo style
 */

import type { FC, CSSProperties } from "react";
import { Link } from "react-router";
import { demoCategories } from "../routes";

const styles = {
  container: {
    background: "var(--rei-demo-gradient-hero)",
    padding: "var(--rei-demo-space-xxl) var(--rei-demo-space-lg)",
    fontFamily: "var(--rei-demo-font-family)",
    color: "var(--rei-demo-text-primary)",
    minHeight: "100%",
  } satisfies CSSProperties,
  hero: {
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
    marginBottom: "var(--rei-demo-space-xxl)",
    position: "relative",
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
  subtitle: {
    fontSize: "var(--rei-demo-font-size-lg)",
    lineHeight: 1.5,
    color: "var(--rei-demo-text-secondary)",
    maxWidth: "640px",
    margin: "0 auto var(--rei-demo-space-xl)",
  } satisfies CSSProperties,
  grid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gridAutoRows: "minmax(200px, auto)",
    gap: "var(--rei-demo-space-lg)",
  } satisfies CSSProperties,
  card: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: "var(--rei-demo-radius-lg)",
    padding: "var(--rei-demo-space-lg)",
    textDecoration: "none",
    color: "inherit",
    transition: "var(--rei-demo-transition)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  } satisfies CSSProperties,
  cardTitle: {
    fontSize: "var(--rei-demo-font-size-xl)",
    fontWeight: 700,
    margin: "0 0 var(--rei-demo-space-sm)",
    color: "var(--rei-demo-text-primary)",
  } satisfies CSSProperties,
  cardDescription: {
    fontSize: "var(--rei-demo-font-size-md)",
    color: "var(--rei-demo-text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  } satisfies CSSProperties,
  cardCount: {
    fontSize: "var(--rei-demo-font-size-sm)",
    color: "var(--rei-demo-text-tertiary)",
    marginTop: "var(--rei-demo-space-md)",
  } satisfies CSSProperties,
};

export const Home: FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroContent}>
          <div style={styles.versionBadge}>{__APP_VERSION__}</div>
          <h1 style={styles.title}>
            React Editor UI
            <br />
            Component Library
          </h1>
          <p style={styles.subtitle}>
            A collection of UI components designed for editor applications.
            Built to work seamlessly with react-panel-layout.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {demoCategories.map((category) => {
          const firstPage = category.pages[0];
          const href = `${category.base}/${firstPage?.path ?? ""}`;
          const plural = category.pages.length !== 1 ? "s" : "";

          return (
            <Link key={category.id} to={href} style={styles.card}>
              <div>
                <h3 style={styles.cardTitle}>{category.label}</h3>
                <p style={styles.cardDescription}>
                  Explore {category.label.toLowerCase()} components
                </p>
              </div>
              <p style={styles.cardCount}>
                {category.pages.length} component{plural}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
