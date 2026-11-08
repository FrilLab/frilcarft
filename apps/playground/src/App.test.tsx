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
    expect(screen.getByText("Click the envelope to open it")).toBeInTheDocument();
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
    expect(screen.getByRole("tabpanel")).toHaveTextContent('envelopeColor={"#123456"}');

    await user.click(screen.getByRole("button", { name: /Reset/ }));
    expect(screen.getByText("You're invited")).toBeInTheDocument();
    expect(document.querySelector(".fc-envelope")).toHaveStyle({ "--fc-envelope-color": "#d9bda7" });
  });

  it("generates valid copied-source TSX for current text and workspace TSX for the private package", async () => {
    const user = userEvent.setup();
    render(<App />);

    const initialCode = screen.getByRole("tabpanel").textContent ?? "";
    expect(initialCode).toContain('import { EnvelopeReveal } from "./components/envelope-reveal";');
    expect(initialCode).toContain('import "./components/envelope-reveal/envelope-reveal.css";');
    expect(initialCode).toContain("<EnvelopeReveal />");

    const titleValue = 'Sam said "hello" \\ again — こんにちは';
    const messageValue = "First line\nSecond line with 'quotes' and \\\nThird line 😀";
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: titleValue } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: messageValue } });

    const code = screen.getByRole("tabpanel").textContent ?? "";
    expect(code).toContain(`title={${JSON.stringify(titleValue)}}`);
    expect(code).toContain(`message={${JSON.stringify(messageValue)}}`);
    expect(code).not.toContain('title={"You\'re invited"}');
    expect(ts.transpileModule(code, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true,
    }).diagnostics?.filter(({ category }) => category === ts.DiagnosticCategory.Error)).toHaveLength(0);

    await user.click(screen.getByRole("tab", { name: "Workspace Usage" }));
    const workspaceCode = screen.getByRole("tabpanel").textContent ?? "";
    expect(workspaceCode).toContain('from "@frillab/interactive/envelope-reveal"');
    expect(workspaceCode).toContain('import "@frillab/interactive/envelope-reveal.css";');
    expect(workspaceCode).toContain(`title={${JSON.stringify(titleValue)}}`);
    expect(workspaceCode).toContain("private and unpublished");
  });

  it("shows and copies each actual source file separately, including the MIT license", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "Source Files" }));
    expect(screen.getByText(/Copy all files into src\/components\/envelope-reveal/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Source file EnvelopeReveal.tsx" })).toHaveTextContent("export function EnvelopeReveal");
    expect(screen.getByRole("region", { name: "Source file index.ts" })).toHaveTextContent("./EnvelopeReveal.js");
    expect(screen.getByRole("region", { name: "Source file envelope-reveal.css" })).toHaveTextContent(".fc-envelope__trigger");
    expect(screen.getByRole("region", { name: "Source file LICENSE" })).toHaveTextContent("Copyright (c) 2026 FrilLab");
    expect(screen.queryByText(/@frillab\/interactive/)).not.toBeInTheDocument();

    const files = [
      ["EnvelopeReveal.tsx", "export function EnvelopeReveal"],
      ["index.ts", "./EnvelopeReveal.js"],
      ["envelope-reveal.css", ".fc-envelope__trigger"],
      ["LICENSE", "Copyright (c) 2026 FrilLab"],
    ];
    for (const [filename, content] of files) {
      await user.click(screen.getByRole("button", { name: `Copy ${filename}` }));
      expect(writeText.mock.calls.at(-1)?.[0]).toContain(content);
    }
    expect(writeText.mock.calls.at(-1)?.[0]).toContain("Permission is hereby granted");
  });

  it("shows an error state when clipboard access is rejected", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("clipboard unavailable")) },
    });
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Copy local source usage" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Copy failed. Select the code in the panel and copy it manually.");
    });
  });
});
