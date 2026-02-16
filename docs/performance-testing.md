# React Performance Testing with E2E + react-scan

このドキュメントでは、E2EテストとReact Scanを組み合わせたReactコンポーネントのパフォーマンステスト手法を説明する。

## 概要

JSDOMではReactの再レンダリング検出が困難なため、Playwright E2Eテストと[react-scan](https://github.com/aidenybai/react-scan)ライブラリを組み合わせてパフォーマンス問題を検出する。

## セットアップ

### 1. react-scanのインストール

```bash
bun add -d react-scan
```

### 2. デモアプリへの統合

`src/demo/main.tsx`でreact-scanを初期化:

```typescript
import { scan } from "react-scan";

if (import.meta.env.DEV) {
  scan({
    enabled: true,
    log: true, // コンソールに再レンダリングをログ出力
  });
}
```

## E2Eテストの作成

### 基本構造

```typescript
// e2e/component-rerender.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Component re-render detection", () => {
  test("should not trigger unnecessary re-renders", async ({ page }) => {
    // コンソールログをキャプチャ
    const rerenderLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("re-rendered")) {
        rerenderLogs.push(text);
      }
    });

    // デモページに移動
    await page.goto("/demo/component-name");

    // 初期レンダリングが完了するまで待機
    await page.waitForSelector("[data-testid='target-component']");

    // ログをクリア（初期レンダリングは無視）
    rerenderLogs.length = 0;

    // 再レンダリングをトリガーしないはずの操作を実行
    await page.click("[data-testid='unrelated-button']");

    // 待機して再レンダリングがないことを確認
    await page.waitForTimeout(100);

    // 不要な再レンダリングがないことを検証
    expect(rerenderLogs).toHaveLength(0);
  });
});
```

### 特定コンポーネントの再レンダリング検出

```typescript
test("child components should not re-render on parent state change", async ({ page }) => {
  const childRerenders: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    // react-scanは "ComponentName re-rendered" 形式でログ出力
    if (text.includes("ChildComponent") && text.includes("re-rendered")) {
      childRerenders.push(text);
    }
  });

  await page.goto("/demo/parent-component");
  await page.waitForSelector("[data-testid='child-component']");

  childRerenders.length = 0;

  // 親の状態を変更
  await page.click("[data-testid='change-parent-state']");
  await page.waitForTimeout(100);

  // 子コンポーネントが再レンダリングされていないことを確認
  expect(childRerenders).toHaveLength(0);
});
```

## パフォーマンス最適化パターン

### 1. React.memoによるコンポーネントメモ化

```typescript
// Before
export function MyComponent({ value }: Props) {
  return <div>{value}</div>;
}

// After
export const MyComponent = memo(function MyComponent({ value }: Props) {
  return <div>{value}</div>;
});
```

### 2. useMemoによるスタイルオブジェクトのメモ化

```typescript
// Before - 毎回新しいオブジェクトが生成される
const style: CSSProperties = {
  display: "flex",
  gap: disabled ? 0 : SPACE_SM,
};

// After - 依存値が変わらない限り同じオブジェクトを返す
const style = useMemo<CSSProperties>(
  () => ({
    display: "flex",
    gap: disabled ? 0 : SPACE_SM,
  }),
  [disabled],
);
```

### 3. useCallbackによるハンドラのメモ化

```typescript
// Before - 毎回新しい関数が生成される
const handleClick = () => {
  onChange(value + 1);
};

// After - 依存値が変わらない限り同じ関数を返す
const handleClick = useCallback(() => {
  onChange(value + 1);
}, [onChange, value]);
```

### 4. サブコンポーネント抽出によるインラインアロー関数の回避

```typescript
// Before - mapループ内のインラインアロー関数がmemoを無効化
{items.map((item) => (
  <ListItem
    key={item.id}
    item={item}
    onClick={() => onSelect(item.id)}  // 毎回新しい関数
  />
))}

// After - サブコンポーネントで安定したコールバックを使用
type ListItemWrapperProps = {
  item: Item;
  onSelect: (id: string) => void;
};

const ListItemWrapper = memo(function ListItemWrapper({
  item,
  onSelect,
}: ListItemWrapperProps) {
  const handleClick = useCallback(() => {
    onSelect(item.id);
  }, [onSelect, item.id]);

  return <ListItem item={item} onClick={handleClick} />;
});

// 使用側
{items.map((item) => (
  <ListItemWrapper key={item.id} item={item} onSelect={onSelect} />
))}
```

### 5. 静的スタイルの定数化

依存値がないスタイルはコンポーネント外で定数として定義:

```typescript
// コンポーネント外で定義（再生成されない）
const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

export const MyComponent = memo(function MyComponent() {
  // containerStyleは常に同じ参照
  return <div style={containerStyle}>...</div>;
});
```

## TDDワークフロー

1. **RED**: E2Eテストで不要な再レンダリングを検出するテストを追加
2. **RED**: 検出された問題を確認
3. **GREEN**: 最適化パターンを適用して修正
4. **確認**: E2Eテストが通ることを確認

## デバッグ方法

### 1. react-scanのビジュアルモード

デモアプリでreact-scanのビジュアルハイライトを有効にする:

```typescript
scan({
  enabled: true,
  log: true,
  highlight: true,  // 再レンダリングされた要素をハイライト
});
```

### 2. Playwright headed modeでの確認

```bash
npx playwright test e2e/rerender.spec.ts --headed
```

### 3. コンソールログの詳細分析

```typescript
page.on("console", (msg) => {
  const text = msg.text();
  if (text.includes("re-rendered")) {
    console.log(`[RERENDER] ${text}`);
  }
});
```

## チェックリスト

コンポーネント作成・修正時の確認項目:

- [ ] コンポーネントが`memo`でラップされているか
- [ ] 動的なスタイルオブジェクトが`useMemo`でメモ化されているか
- [ ] イベントハンドラが`useCallback`でメモ化されているか
- [ ] mapループ内でインラインアロー関数を使用していないか
- [ ] 依存値のない静的スタイルがコンポーネント外で定義されているか
- [ ] E2Eテストで不要な再レンダリングがないことを確認したか

## 関連リソース

- [react-scan GitHub](https://github.com/aidenybai/react-scan)
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useMemo Documentation](https://react.dev/reference/react/useMemo)
- [useCallback Documentation](https://react.dev/reference/react/useCallback)
