import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useAutoResize } from "./useAutoResize";

function createMockTextarea(scrollHeight: number): HTMLTextAreaElement {
  const style = { height: "" };
  return {
    style,
    get scrollHeight() {
      return scrollHeight;
    },
  } as unknown as HTMLTextAreaElement;
}

describe("useAutoResize", () => {
  let mockTextarea: HTMLTextAreaElement;

  beforeEach(() => {
    mockTextarea = createMockTextarea(50);
  });

  it("sets height based on scrollHeight", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(mockTextarea);
      useAutoResize(ref, "some text");
      return ref;
    });

    expect(mockTextarea.style.height).toBe("50px");
  });

  it("respects minHeight option", () => {
    const textarea = createMockTextarea(10); // Less than minHeight

    renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(textarea);
      useAutoResize(ref, "text", { minHeight: 24 });
      return ref;
    });

    expect(textarea.style.height).toBe("24px");
  });

  it("respects maxHeight option", () => {
    const textarea = createMockTextarea(500); // More than maxHeight

    renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(textarea);
      useAutoResize(ref, "text", { maxHeight: 200 });
      return ref;
    });

    expect(textarea.style.height).toBe("200px");
  });

  it("uses default minHeight of 24", () => {
    const textarea = createMockTextarea(10);

    renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(textarea);
      useAutoResize(ref, "text");
      return ref;
    });

    expect(textarea.style.height).toBe("24px");
  });

  it("uses default maxHeight of 200", () => {
    const textarea = createMockTextarea(500);

    renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(textarea);
      useAutoResize(ref, "text");
      return ref;
    });

    expect(textarea.style.height).toBe("200px");
  });

  it("resets height to auto before measuring", () => {
    const heightChanges: string[] = [];
    const style = {
      _height: "",
      set height(val: string) {
        heightChanges.push(val);
        this._height = val;
      },
      get height() {
        return this._height;
      },
    };
    const textarea = {
      style,
      get scrollHeight() {
        return 50;
      },
    } as unknown as HTMLTextAreaElement;

    renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(textarea);
      useAutoResize(ref, "text");
      return ref;
    });

    // Should set to "auto" first, then to final height
    expect(heightChanges).toContain("auto");
  });

  it("does nothing when ref is null", () => {
    // Should not throw
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLTextAreaElement>(null);
        useAutoResize(ref, "text");
        return ref;
      });
    }).not.toThrow();
  });

  it("updates height when value changes", () => {
    let currentScrollHeight = 50;
    const style = { height: "" };
    const textarea = {
      style,
      get scrollHeight() {
        return currentScrollHeight;
      },
    } as unknown as HTMLTextAreaElement;

    const { rerender } = renderHook(
      ({ value }) => {
        const ref = useRef<HTMLTextAreaElement>(textarea);
        useAutoResize(ref, value);
        return ref;
      },
      { initialProps: { value: "short" } },
    );

    currentScrollHeight = 100;
    rerender({ value: "longer text that takes more space" });

    expect(textarea.style.height).toBe("100px");
  });

  it("clamps height between min and max", () => {
    const textarea = createMockTextarea(100);

    renderHook(() => {
      const ref = useRef<HTMLTextAreaElement>(textarea);
      useAutoResize(ref, "text", { minHeight: 50, maxHeight: 80 });
      return ref;
    });

    // scrollHeight is 100, but max is 80
    expect(textarea.style.height).toBe("80px");
  });
});
