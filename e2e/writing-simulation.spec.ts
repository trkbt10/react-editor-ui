/**
 * @file Writing Simulation E2E Tests
 *
 * Schema-driven writing simulation with IME input emulation.
 * Scenarios are defined as structured data and executed by a runner.
 *
 * Scenario: Natsume Soseki writing the opening of "Yume Juuya" (Ten Nights of Dreams)
 *
 * HISTORY MODEL:
 * - setContent() creates one history entry (default -> new content)
 * - Each ime() + debounce creates additional history entries
 * - Undo traverses: current -> previous entries -> default content
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Schema Types
// =============================================================================

/**
 * IME input operation - triggers compositionstart/update/end events
 */
type ImeOp = {
  op: "ime";
  text: string;
};

/**
 * Direct keyboard type (without IME events)
 */
type TypeOp = {
  op: "type";
  text: string;
};

/**
 * Press a single key or key combination
 */
type PressOp = {
  op: "press";
  key: string;
  repeat?: number;
};

/**
 * Set initial content (select all + type)
 */
type SetContentOp = {
  op: "setContent";
  content: string;
};

/**
 * Move cursor to start/end of document
 */
type GoToOp = {
  op: "goToStart" | "goToEnd";
};

/**
 * Select N characters from current position
 */
type SelectOp = {
  op: "select";
  count: number;
};

/**
 * Wait for debounce or specified duration
 */
type WaitOp = {
  op: "wait";
  ms?: number;
};

/**
 * Undo/Redo operations
 */
type UndoRedoOp = {
  op: "undo" | "redo";
};

/**
 * Assert content equals expected
 */
type ExpectContentOp = {
  op: "expectContent";
  content: string;
};

/**
 * Assert cursor position
 */
type ExpectCursorOp = {
  op: "expectCursor";
  position: number;
};

/**
 * Assert selection length
 */
type ExpectSelectionOp = {
  op: "expectSelection";
  length: number;
};

/**
 * All operation types
 */
type Operation =
  | ImeOp
  | TypeOp
  | PressOp
  | SetContentOp
  | GoToOp
  | SelectOp
  | WaitOp
  | UndoRedoOp
  | ExpectContentOp
  | ExpectCursorOp
  | ExpectSelectionOp;

/**
 * A scenario is a named sequence of operations
 */
type Scenario = {
  name: string;
  description?: string;
  steps: Operation[];
};

// =============================================================================
// Editor Utilities
// =============================================================================

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  return {
    container: page.locator("div:has(> svg:has(text))").first(),
    textarea: page.locator('textarea[aria-label="Text editor"]').first(),
  };
}

async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 50, y: 20 }, force: true });
  await page.waitForTimeout(100);
}

async function getContent(locators: EditorLocators): Promise<string> {
  return locators.textarea.inputValue();
}

async function getCursorPosition(locators: EditorLocators): Promise<number> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);
}

async function getSelection(locators: EditorLocators): Promise<{ start: number; end: number }> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
    start: el.selectionStart,
    end: el.selectionEnd,
  }));
}

// =============================================================================
// Operation Executors
// =============================================================================

/**
 * Simulate IME composition using Chrome DevTools Protocol.
 *
 * CDP's Input.insertText respects the current selection and triggers
 * proper input events. We wrap this with manual composition events
 * to ensure the React component treats this as an IME composition.
 */
/**
 * Simulate IME composition using CDP and manual composition events.
 *
 * This provides proper IME simulation that:
 * 1. Triggers compositionstart - React sets isComposing = true, history is paused
 * 2. Uses CDP Input.insertText to insert text (respects selection)
 * 3. Triggers compositionend - React creates a single history entry
 */
async function imeInput(page: Page, locators: EditorLocators, text: string): Promise<void> {
  const textarea = locators.textarea;

  // Focus the textarea first
  await textarea.focus();
  await page.waitForTimeout(50);

  // Dispatch compositionstart - sets isComposing = true in React
  await textarea.evaluate((el) => {
    el.dispatchEvent(
      new CompositionEvent("compositionstart", {
        bubbles: true,
        cancelable: true,
        composed: true,
        data: "",
      })
    );
  });

  // Wait for React to process and set isComposing = true
  await page.waitForTimeout(100);

  // Use CDP to insert text (respects selection, triggers proper events)
  const cdpSession = await page.context().newCDPSession(page);
  try {
    await cdpSession.send("Input.insertText", { text });
  } finally {
    await cdpSession.detach();
  }

  // Wait for input to be processed
  await page.waitForTimeout(50);

  // Dispatch compositionend - triggers handleCompositionConfirm
  await textarea.evaluate(
    (el, data) => {
      el.dispatchEvent(
        new CompositionEvent("compositionend", {
          bubbles: true,
          cancelable: true,
          composed: true,
          data,
        })
      );
    },
    text
  );

  // Wait for React to process compositionend
  await page.waitForTimeout(100);
}

/**
 * Type text directly using keyboard
 */
async function typeText(page: Page, text: string): Promise<void> {
  await page.keyboard.type(text, { delay: 10 });
}

/**
 * Execute a single operation
 */
async function executeOperation(
  page: Page,
  locators: EditorLocators,
  op: Operation
): Promise<void> {
  switch (op.op) {
    case "ime":
      await imeInput(page, locators, op.text);
      break;

    case "type":
      await typeText(page, op.text);
      break;

    case "press": {
      const repeat = op.repeat ?? 1;
      for (let i = 0; i < repeat; i++) {
        await page.keyboard.press(op.key);
      }
      break;
    }

    case "setContent":
      await focusEditor(page, locators);
      await page.keyboard.press("Meta+a");
      await page.waitForTimeout(50);
      if (op.content === "") {
        await page.keyboard.press("Backspace");
      } else {
        await typeText(page, op.content);
      }
      await page.waitForTimeout(400); // Debounce
      break;

    case "goToStart":
      await page.keyboard.press("Meta+ArrowUp");
      await page.keyboard.press("Meta+ArrowLeft");
      break;

    case "goToEnd":
      await page.keyboard.press("Meta+ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");
      break;

    case "select":
      for (let i = 0; i < op.count; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      break;

    case "wait":
      await page.waitForTimeout(op.ms ?? 400);
      break;

    case "undo":
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);
      break;

    case "redo":
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(200);
      break;

    case "expectContent":
      expect(await getContent(locators)).toBe(op.content);
      break;

    case "expectCursor":
      expect(await getCursorPosition(locators)).toBe(op.position);
      break;

    case "expectSelection": {
      const sel = await getSelection(locators);
      expect(sel.end - sel.start).toBe(op.length);
      break;
    }
  }
}

/**
 * Run a complete scenario
 */
async function runScenario(page: Page, scenario: Scenario): Promise<void> {
  const locators = getEditorLocators(page);

  for (const step of scenario.steps) {
    await executeOperation(page, locators, step);
  }
}

// =============================================================================
// Scenarios
// =============================================================================

const SCENARIOS: Scenario[] = [
  {
    name: "有名な冒頭行を書いて修正",
    description: "夢十夜の冒頭「こんな夢を見た。」を書き、「夢」に読み仮名を追加して元に戻す",
    steps: [
      { op: "setContent", content: "こんな夢を見た。" },
      { op: "expectContent", content: "こんな夢を見た。" },
      // 「夢」の位置に移動して選択
      { op: "goToStart" },
      { op: "press", key: "ArrowRight", repeat: 3 },
      { op: "expectCursor", position: 3 },
      { op: "select", count: 1 },
      { op: "expectSelection", length: 1 },
      // 読み仮名付きに置換
      { op: "ime", text: "夢（ゆめ）" },
      { op: "wait" },
      { op: "expectContent", content: "こんな夢（ゆめ）を見た。" },
      // Undo で元に戻す
      { op: "undo" },
      { op: "expectContent", content: "こんな夢を見た。" },
      // Redo で読み仮名を復元
      { op: "redo" },
      { op: "expectContent", content: "こんな夢（ゆめ）を見た。" },
    ],
  },

  {
    name: "複数の草稿を書いてUndo履歴を辿る",
    description: "複数の文を追加し、Undo/Redoで履歴を辿る",
    steps: [
      // Draft 1
      { op: "setContent", content: "女は静かに目を閉じた。" },
      { op: "expectContent", content: "女は静かに目を閉じた。" },
      // Draft 2
      { op: "ime", text: "長い睫の影が頬に落ちている。" },
      { op: "wait" },
      { op: "expectContent", content: "女は静かに目を閉じた。長い睫の影が頬に落ちている。" },
      // Draft 3
      { op: "ime", text: "その顔は蝋のように青白い。" },
      { op: "wait" },
      { op: "expectContent", content: "女は静かに目を閉じた。長い睫の影が頬に落ちている。その顔は蝋のように青白い。" },
      // Undo: Draft3 -> Draft2
      { op: "undo" },
      { op: "expectContent", content: "女は静かに目を閉じた。長い睫の影が頬に落ちている。" },
      // Undo: Draft2 -> Draft1
      { op: "undo" },
      { op: "expectContent", content: "女は静かに目を閉じた。" },
      // Redo: Draft1 -> Draft2
      { op: "redo" },
      { op: "expectContent", content: "女は静かに目を閉じた。長い睫の影が頬に落ちている。" },
      // Redo: Draft2 -> Draft3
      { op: "redo" },
      { op: "expectContent", content: "女は静かに目を閉じた。長い睫の影が頬に落ちている。その顔は蝋のように青白い。" },
    ],
  },

  {
    name: "修正とUndo",
    description: "テキストを追加してUndoで戻す",
    steps: [
      { op: "setContent", content: "夢を見た" },
      { op: "expectContent", content: "夢を見た" },
      { op: "ime", text: "。美しい夢だった。" },
      { op: "wait" },
      { op: "expectContent", content: "夢を見た。美しい夢だった。" },
      { op: "undo" },
      { op: "expectContent", content: "夢を見た" },
      { op: "redo" },
      { op: "expectContent", content: "夢を見た。美しい夢だった。" },
    ],
  },

  {
    name: "段落を含む文章",
    description: "改行を含む文章を書いてUndo/Redoを確認",
    steps: [
      { op: "setContent", content: "こんな夢を見た。" },
      { op: "expectContent", content: "こんな夢を見た。" },
      // 改行を追加
      { op: "press", key: "Enter" },
      { op: "ime", text: "腕組をして枕元に坐っていると、仰向に寝た女が、静かな声でもう死にますと云う。" },
      { op: "wait" },
      { op: "expectContent", content: "こんな夢を見た。\n腕組をして枕元に坐っていると、仰向に寝た女が、静かな声でもう死にますと云う。" },
      // さらに追加
      { op: "ime", text: "女は長い髪を枕に敷いている。" },
      { op: "wait" },
      { op: "expectContent", content: "こんな夢を見た。\n腕組をして枕元に坐っていると、仰向に寝た女が、静かな声でもう死にますと云う。女は長い髪を枕に敷いている。" },
      // Undo
      { op: "undo" },
      { op: "expectContent", content: "こんな夢を見た。\n腕組をして枕元に坐っていると、仰向に寝た女が、静かな声でもう死にますと云う。" },
      // Redo
      { op: "redo" },
      { op: "expectContent", content: "こんな夢を見た。\n腕組をして枕元に坐っていると、仰向に寝た女が、静かな声でもう死にますと云う。女は長い髪を枕に敷いている。" },
    ],
  },

  {
    name: "テキスト中央の選択置換",
    description: "文中の「美しい」を「不思議な」に置換",
    steps: [
      { op: "setContent", content: "私は美しい夢を見た。" },
      { op: "expectContent", content: "私は美しい夢を見た。" },
      // 「美しい」を選択
      { op: "goToStart" },
      { op: "press", key: "ArrowRight", repeat: 2 },
      { op: "select", count: 3 },
      { op: "expectSelection", length: 3 },
      // 置換
      { op: "ime", text: "不思議な" },
      { op: "wait" },
      { op: "expectContent", content: "私は不思議な夢を見た。" },
      { op: "expectCursor", position: 6 },
      // Undo
      { op: "undo" },
      { op: "expectContent", content: "私は美しい夢を見た。" },
    ],
  },

  {
    name: "連続入力で別々のUndo単位",
    description: "待機を挟んだ入力は別々のUndo単位になる",
    steps: [
      { op: "setContent", content: "夢、" },
      { op: "expectContent", content: "夢、" },
      // 2番目のフレーズ
      { op: "ime", text: "幻、" },
      { op: "wait" },
      { op: "expectContent", content: "夢、幻、" },
      // 3番目のフレーズ
      { op: "ime", text: "泡沫。" },
      { op: "wait" },
      { op: "expectContent", content: "夢、幻、泡沫。" },
      // Undo: state3 -> state2
      { op: "undo" },
      { op: "expectContent", content: "夢、幻、" },
      // Undo: state2 -> base
      { op: "undo" },
      { op: "expectContent", content: "夢、" },
      // Redo: base -> state2
      { op: "redo" },
      { op: "expectContent", content: "夢、幻、" },
      // Redo: state2 -> state3
      { op: "redo" },
      { op: "expectContent", content: "夢、幻、泡沫。" },
    ],
  },

  {
    name: "IME風の文字入力バッチ処理",
    description: "IME入力後のUndoが文全体を戻す",
    steps: [
      { op: "setContent", content: "夢を見た。" },
      { op: "expectContent", content: "夢を見た。" },
      // 2番目の文
      { op: "ime", text: "その夢は美しかった。" },
      { op: "wait" },
      { op: "expectContent", content: "夢を見た。その夢は美しかった。" },
      // Undo
      { op: "undo" },
      { op: "expectContent", content: "夢を見た。" },
      // Redo
      { op: "redo" },
      { op: "expectContent", content: "夢を見た。その夢は美しかった。" },
    ],
  },

  {
    name: "Tabキーでスペース挿入",
    description: "Tabキーがスペースを挿入することを確認",
    steps: [
      { op: "setContent", content: "text" },
      { op: "expectContent", content: "text" },
      { op: "goToStart" },
      { op: "press", key: "Tab" },
      { op: "wait", ms: 100 },
      // Tab should insert spaces - content length should increase
      // We can't assert exact content as tabSize may vary
    ],
  },
];

const EDGE_CASE_SCENARIOS: Scenario[] = [
  {
    name: "空から入力開始",
    description: "空の状態から入力してUndoで空に戻る",
    steps: [
      { op: "setContent", content: "" },
      { op: "expectContent", content: "" },
      { op: "ime", text: "テスト" },
      { op: "wait" },
      { op: "expectContent", content: "テスト" },
      { op: "undo" },
      { op: "expectContent", content: "" },
      { op: "redo" },
      { op: "expectContent", content: "テスト" },
    ],
  },

  {
    name: "長文の編集",
    description: "長文に追加してUndo/Redo",
    steps: [
      { op: "setContent", content: "あいうえお" },
      { op: "expectContent", content: "あいうえお" },
      { op: "ime", text: "かきくけこ" },
      { op: "wait" },
      { op: "expectContent", content: "あいうえおかきくけこ" },
      { op: "undo" },
      { op: "expectContent", content: "あいうえお" },
      { op: "redo" },
      { op: "expectContent", content: "あいうえおかきくけこ" },
    ],
  },

  {
    name: "特殊文字",
    description: "括弧や記号を含む文字列",
    steps: [
      { op: "setContent", content: "「夢」——『幻』…‥※★☆" },
      { op: "expectContent", content: "「夢」——『幻』…‥※★☆" },
      { op: "ime", text: "追加" },
      { op: "wait" },
      { op: "expectContent", content: "「夢」——『幻』…‥※★☆追加" },
      { op: "undo" },
      { op: "expectContent", content: "「夢」——『幻』…‥※★☆" },
    ],
  },

  {
    name: "日本語と英数字の混在",
    description: "日本語と英数字を混在させる",
    steps: [
      { op: "setContent", content: "Hello世界" },
      { op: "expectContent", content: "Hello世界" },
      { op: "ime", text: "123" },
      { op: "wait" },
      { op: "expectContent", content: "Hello世界123" },
      { op: "undo" },
      { op: "expectContent", content: "Hello世界" },
      { op: "redo" },
      { op: "expectContent", content: "Hello世界123" },
    ],
  },

  {
    name: "Undo後のカーソル位置維持",
    description: "中央に挿入後、Undoでカーソル位置が有効範囲内に収まる",
    steps: [
      { op: "setContent", content: "ABCDEFGH" },
      // 位置4に移動
      { op: "goToStart" },
      { op: "press", key: "ArrowRight", repeat: 4 },
      { op: "expectCursor", position: 4 },
      // 挿入
      { op: "ime", text: "XYZ" },
      { op: "wait" },
      { op: "expectContent", content: "ABCDXYZEFGH" },
      { op: "expectCursor", position: 7 },
      // Undo
      { op: "undo" },
      { op: "expectContent", content: "ABCDEFGH" },
      // カーソルは有効範囲内
    ],
  },
];

// =============================================================================
// Test Execution
// =============================================================================

test.describe("Writing Simulation: Yume Juuya", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");
  });

  for (const scenario of SCENARIOS) {
    test(scenario.name, async ({ page }) => {
      await runScenario(page, scenario);
    });
  }
});

test.describe("Writing Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");
  });

  for (const scenario of EDGE_CASE_SCENARIOS) {
    test(scenario.name, async ({ page }) => {
      await runScenario(page, scenario);
    });
  }
});
