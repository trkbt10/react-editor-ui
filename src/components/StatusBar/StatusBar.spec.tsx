/**
 * @file StatusBar tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { StatusBar } from "./StatusBar";
import { StatusBarItem } from "./StatusBarItem";

describe("StatusBar", () => {
  it("renders children", () => {
    render(
      <StatusBar>
        <span>Status 1</span>
        <span>Status 2</span>
      </StatusBar>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Status 1")).toBeInTheDocument();
    expect(screen.getByText("Status 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<StatusBar className="custom-statusbar">Content</StatusBar>);
    expect(screen.getByRole("status")).toHaveClass("custom-statusbar");
  });
});

describe("StatusBarItem", () => {
  it("renders children", () => {
    render(<StatusBarItem>Item Content</StatusBarItem>);
    expect(screen.getByText("Item Content")).toBeInTheDocument();
  });

  it("renders as span when not clickable", () => {
    render(<StatusBarItem>Static</StatusBarItem>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders as button when clickable", () => {
    render(<StatusBarItem onClick={() => {}}>Clickable</StatusBarItem>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles click events", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };
    render(<StatusBarItem onClick={handleClick}>Click me</StatusBarItem>);

    fireEvent.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("applies custom className to span", () => {
    render(<StatusBarItem className="custom-item">Item</StatusBarItem>);
    expect(screen.getByText("Item")).toHaveClass("custom-item");
  });

  it("applies custom className to button", () => {
    render(
      <StatusBarItem onClick={() => {}} className="custom-item">
        Item
      </StatusBarItem>,
    );
    expect(screen.getByRole("button")).toHaveClass("custom-item");
  });
});

describe("StatusBar composition", () => {
  it("composes StatusBar with StatusBarItems", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    render(
      <StatusBar>
        <StatusBarItem>Line: 42, Col: 10</StatusBarItem>
        <StatusBarItem>UTF-8</StatusBarItem>
        <StatusBarItem onClick={handleClick}>LF</StatusBarItem>
      </StatusBar>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Line: 42, Col: 10")).toBeInTheDocument();
    expect(screen.getByText("UTF-8")).toBeInTheDocument();
    expect(screen.getByText("LF")).toBeInTheDocument();

    fireEvent.click(screen.getByText("LF"));
    expect(clicked).toBe(true);
  });
});
