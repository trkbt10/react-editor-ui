/**
 * @file LogEntry tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { LogEntry } from "./LogEntry";

describe("LogEntry", () => {
  it("renders message", () => {
    render(<LogEntry message="Test message" />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders with info level by default", () => {
    render(<LogEntry message="Info message" />);
    expect(screen.getByText("[INFO]")).toBeInTheDocument();
  });

  it("renders with warning level", () => {
    render(<LogEntry message="Warning message" level="warning" />);
    expect(screen.getByText("[WARN]")).toBeInTheDocument();
  });

  it("renders with error level", () => {
    render(<LogEntry message="Error message" level="error" />);
    expect(screen.getByText("[ERROR]")).toBeInTheDocument();
  });

  it("renders with debug level", () => {
    render(<LogEntry message="Debug message" level="debug" />);
    expect(screen.getByText("[DEBUG]")).toBeInTheDocument();
  });

  it("renders with success level", () => {
    render(<LogEntry message="Success message" level="success" />);
    expect(screen.getByText("[OK]")).toBeInTheDocument();
  });

  it("renders timestamp as string", () => {
    render(<LogEntry message="Message" timestamp="2024-01-15T10:30:45.123Z" />);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("renders timestamp as Date", () => {
    const date = new Date("2024-01-15T10:30:45.123Z");
    render(<LogEntry message="Message" timestamp={date} />);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("renders source", () => {
    render(<LogEntry message="Message" source="app.tsx:42" />);
    expect(screen.getByText("app.tsx:42")).toBeInTheDocument();
  });

  it("renders details", () => {
    render(
      <LogEntry
        message="Error occurred"
        details="Stack trace:\n  at function1\n  at function2"
      />,
    );
    expect(screen.getByText(/Stack trace:/)).toBeInTheDocument();
  });

  it("handles click events", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };
    render(<LogEntry message="Clickable" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("renders as log role when not clickable", () => {
    render(<LogEntry message="Static" />);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("renders as button role when clickable", () => {
    render(<LogEntry message="Clickable" onClick={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows selected state", () => {
    render(<LogEntry message="Selected" selected />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("log")).toHaveStyle({
      backgroundColor: "var(--rei-color-selected, rgba(37, 99, 235, 0.1))",
    });
  });

  it("applies custom className", () => {
    render(<LogEntry message="Custom" className="custom-log" />);
    expect(screen.getByRole("log")).toHaveClass("custom-log");
  });

  it("applies level colors", () => {
    const { rerender } = render(<LogEntry message="Info" level="info" />);
    expect(screen.getByText("[INFO]")).toHaveStyle({
      color: "var(--rei-color-log-info, #6b7280)",
    });

    rerender(<LogEntry message="Error" level="error" />);
    expect(screen.getByText("[ERROR]")).toHaveStyle({
      color: "var(--rei-color-log-error, #dc2626)",
    });
  });
});
