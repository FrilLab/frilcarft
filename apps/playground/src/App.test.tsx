import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ts from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.js";
import { componentCatalog } from "./catalog.js";

describe("Playground", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Envelope Reveal and renders the package component in its preview", () => {
    render(<App />);

    expect(componentCatalog.map(({ id }) => id)).toEqual(["envelope-reveal"]);
    expect(screen.getByRole("navigation", { name: "Components" })).toHaveTextContent("Envelope Reveal");
    expect(screen.getByRole("button", { name: "Open the letter" })).toBeInTheDocument();
    expect(document.querySelector(".fc-envelope__message")).toHaveTextContent("A little something, just for you.");
  });

  it("updates the preview immediately and reset restores component defaults", async () => {
    const user = userEvent.setup();
    render(<App />);

    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Save the date");
    expect(screen.getByText("Save the date")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Envelope color"), { target: { value: "#123456" } });
    expect(document.querySelector(".fc-envelope")).toHaveStyle({ "--fc-envelope-color": "#123456" });

    await user.click(screen.getByRole("button", { name: /Reset/ }));
    expect(screen.getByText("You're invited")).toBeInTheDocument();
    expect(document.querySelector(".fc-envelope")).toHaveStyle({ "--fc-envelope-color": "#d9bda7" });
  });

  it("generates valid usage TSX with escaped current strings", async () => {
    const user = userEvent.setup();
    render(<App />);
    const titleValue = 'Sam said "hello" \\ again';
    const messageValue = "First line\nSecond line with 'quotes' and \\";

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), titleValue);
    await user.clear(screen.getByLabelText("Message"));
    await user.type(screen.getByLabelText("Message"), messageValue);

    const code = screen.getByRole("tabpanel").textContent ?? "";
    expect(code).toContain(`title={${JSON.stringify(titleValue)}}`);
    expect(code).toContain(`message={${JSON.stringify(messageValue)}}`);
    expect(code).toContain("@frillab/interactive/envelope-reveal");
    expect(code).not.toContain('title={"You\'re invited"}');

    const compiled = ts.transpileModule(code, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true,
    });
    expect(compiled.diagnostics?.filter(({ category }) => category === ts.DiagnosticCategory.Error)).toHaveLength(0);
  });

  it("copies usage code and the actual implementation files with license", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Copy usage code" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Usage code copied."));
    expect(writeText.mock.calls[0][0]).toContain('import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";');

    await user.click(screen.getByRole("tab", { name: /Component source/ }));
    const source = screen.getByRole("tabpanel").textContent ?? "";
    expect(source).toContain("===== EnvelopeReveal.tsx =====");
    expect(source).toContain("===== envelope-reveal.css =====");
    expect(source).toContain(".fc-envelope__trigger");
    expect(source).toContain("===== LICENSE (MIT) =====");
    expect(source).toContain("Copyright (c) 2026 FrilLab");

    await user.click(screen.getByRole("button", { name: "Copy component source" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Component source copied."));
    expect(writeText).toHaveBeenLastCalledWith(source);
  });

  it("shows an error state when clipboard access is rejected", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("clipboard unavailable")) },
    });
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Copy usage code" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Copy failed. Select the code in the panel and copy it manually.");
    });
  });
});
