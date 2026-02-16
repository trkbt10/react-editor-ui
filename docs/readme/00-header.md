<p align="center">
  <h1 align="center">React Editor UI</h1>
  <p align="center">
    <strong>Modern design system components for editor interfaces</strong>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-editor-ui"><img src="https://img.shields.io/npm/v/react-editor-ui.svg?style=flat-square&color=0066ff" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/react-editor-ui"><img src="https://img.shields.io/npm/dm/react-editor-ui.svg?style=flat-square&color=0066ff" alt="npm downloads"></a>
  <a href="https://github.com/trkbt10/react-editor-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Unlicense-blue.svg?style=flat-square" alt="license"></a>
  <a href="https://github.com/trkbt10/react-editor-ui"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19+-61dafb.svg?style=flat-square&logo=react&logoColor=black" alt="React"></a>
</p>

<p align="center">
  <a href="https://trkbt10.github.io/react-editor-ui/">Demo</a> &bull;
  <a href="#installation">Installation</a> &bull;
  <a href="#components">Components</a> &bull;
  <a href="#theming">Theming</a>
</p>

---

A collection of UI components designed for building editor interfaces, design tools, and creative applications. Inspired by modern design tools.

## Features

- **Modern design** - Clean, minimal aesthetics with attention to detail
- **CSS-in-JS free** - Uses CSS custom properties for zero-runtime theming
- **Tree-shakeable** - Import only what you need for optimal bundle size
- **TypeScript first** - Full type definitions with strict typing
- **Zero dependencies** - No runtime CSS or styling library required

## Installation

```bash
npm install react-editor-ui
```

```bash
bun add react-editor-ui
```

## Quick Start

```tsx
import { Button, Input, Toolbar } from "react-editor-ui";

function App() {
  return (
    <Toolbar>
      <Input placeholder="Search..." />
      <Button variant="primary">Save</Button>
    </Toolbar>
  );
}
```

