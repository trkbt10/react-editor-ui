# Design Principles

## Overview

react-editor-ui は、エディタ向けの UI パーツを提供するコンポーネントライブラリです。
レイアウト用コンポーネントである [react-panel-layout](https://github.com/trkbt10/react-panel-layout) と組み合わせて使用することを想定しています。

## 基本方針

### 1. CSS-in-JS / Tailwind を使用しない

- CSS Modules、styled-components、Tailwind CSS などの外部スタイリングソリューションは使用しません
- すべてのスタイルは **インラインスタイル** として React コンポーネント内で定義します
- これにより、外部依存を最小化し、バンドルサイズを削減します

### 2. デザイントークンとしての CSS 変数

- すべての装飾値（色、サイズ、間隔など）は **CSS 変数** として公開します
- CSS 変数プレフィックス: `--rei-` (react-editor-ui)
- 利用者は CSS 変数を上書きすることで、テーマのカスタマイズが可能です
- react-panel-layout の `--rpl-` との競合を避けるため、独自のプレフィックスを使用します

```tsx
// コンポーネント内でのスタイル定義例
const style: CSSProperties = {
  backgroundColor: "var(--rei-color-surface, #ffffff)",
  borderRadius: "var(--rei-radius-md, 4px)",
  padding: "var(--rei-space-md, 8px)",
};
```

### 3. 役割分担

| ライブラリ | 役割 |
|-----------|------|
| **react-panel-layout** | レイアウト（グリッド、パネル分割、タブ、ドロワー） |
| **react-editor-ui** | UI パーツ（ボタン、入力、ツールバー、メニューなど） |

- react-panel-layout がコンテナ・骨格を担当
- react-editor-ui がその中に配置される個々のインタラクティブ要素を担当

### 4. デザインの一貫性

- 基本的なデザイン言語は react-panel-layout を踏襲します（ダークテーマ、コンパクトなサイジング）
- ただし、デザイントークンはこのパッケージで独自に定義し、`--rpl-` と被らないようにします
- 両ライブラリを組み合わせた際に、自然に調和するデザインを目指します

## CSS 変数の命名規則

```
--rei-{category}-{name}
```

### カテゴリ一覧

| カテゴリ | 用途 | 例 |
|---------|------|-----|
| `color` | 色 | `--rei-color-primary`, `--rei-color-surface` |
| `space` | 余白・間隔 | `--rei-space-sm`, `--rei-space-md` |
| `size` | サイズ（フォント、アイコンなど） | `--rei-size-font-sm`, `--rei-size-icon` |
| `radius` | 角丸 | `--rei-radius-sm`, `--rei-radius-full` |
| `shadow` | ドロップシャドウ | `--rei-shadow-sm`, `--rei-shadow-lg` |
| `z` | z-index | `--rei-z-dropdown`, `--rei-z-tooltip` |
| `duration` | アニメーション時間 | `--rei-duration-fast`, `--rei-duration-normal` |
| `easing` | イージング関数 | `--rei-easing-default` |

## 実装ガイドライン

### スタイル定数の定義

すべてのスタイル値は `src/constants/styles.ts` で定義します：

```tsx
// src/constants/styles.ts
export const CSS_VAR_PREFIX = "rei";

// Colors
export const COLOR_PRIMARY = "var(--rei-color-primary, #2196f3)";
export const COLOR_SURFACE = "var(--rei-color-surface, #1e1f24)";

// Spacing
export const SPACE_SM = "var(--rei-space-sm, 4px)";
export const SPACE_MD = "var(--rei-space-md, 8px)";
```

### コンポーネントでの使用

```tsx
import { COLOR_PRIMARY, SPACE_MD } from "../constants/styles";

export const Button: FC<ButtonProps> = ({ children }) => {
  return (
    <button
      style={{
        backgroundColor: COLOR_PRIMARY,
        padding: SPACE_MD,
      }}
    >
      {children}
    </button>
  );
};
```

### ユーザーによるカスタマイズ

```css
/* ユーザーの CSS */
:root {
  --rei-color-primary: #ff6b6b;
  --rei-radius-md: 8px;
}
```

## ディレクトリ構造

```
src/
├── index.tsx              # ライブラリエントリポイント
├── constants/
│   └── styles.ts          # デザイントークン（CSS 変数）
├── components/
│   ├── index.ts           # コンポーネント barrel export
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.spec.tsx
│   └── ...
└── demo/
    ├── index.tsx          # デモエントリポイント
    └── App.tsx            # デモアプリ
```

## 参考

- [react-panel-layout Design Tokens](https://github.com/trkbt10/react-panel-layout/blob/main/docs/design-tokens.md)
