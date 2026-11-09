import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ts from "typescript-api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.js";
import { componentCatalog } from "./catalog/index.js";

async function renderDetail() {
  render(<App />);
  await screen.findByRole("button", { name: "Open the letter" });
}

async function historyMove(direction: "back" | "forward") {
  await act(async () => {
    await new Promise<void>((resolve) => {
      window.addEventListener("popstate", () => resolve(), { once: true });
      window.history[direction]();
    });
  });
}

describe("Playground", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/components/envelope-reveal");
  });

  it("opens the editorial gallery and navigates to details and back", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Small details. Made to move." })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Explore Envelope Reveal" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Open the letter" })).not.toBeInTheDocument();
    expect(screen.queryByText("WORKSPACE")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toHaveTextContent("Components");

    await user.click(screen.getByRole("link", { name: "Explore Envelope Reveal" }));
    expect(window.location.pathname).toBe("/components/envelope-reveal");
    expect(await screen.findByRole("button", { name: "Open the letter" })).toBeInTheDocument();

    await historyMove("back");
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("heading", { name: "Small details. Made to move." })).toBeInTheDocument();
    await historyMove("forward");
    expect(await screen.findByRole("button", { name: "Open the letter" })).toBeInTheDocument();
  });

  it("loads direct component paths and shows a useful not-found state for unknown URLs", async () => {
    const view = render(<App />);
    expect(await screen.findByRole("button", { name: "Open the letter" })).toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, "", "/components/unknown-component");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(screen.getByRole("heading", { name: "Component not found." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to all components" })).toHaveAttribute("href", "/");

    view.unmount();
  });

  it("lists Envelope Reveal and renders the package component in its preview", async () => {
    await renderDetail();

    expect(componentCatalog.map(({ id }) => id)).toEqual(["envelope-reveal"]);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("All components");
    expect(screen.getByRole("heading", { name: "Try the preview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Interaction" })).toHaveAttribute("href", "/?category=interaction");
    expect(screen.getByRole("button", { name: "Open the letter" })).toBeInTheDocument();
    expect(document.querySelector('[data-component="envelope-reveal"]')).toHaveTextContent("A little something, just for you.");
    expect(screen.getByText("Click the envelope to open it")).toBeInTheDocument();
  });

  it("filters the gallery from lightweight metadata and keeps detail loading lazy", async () => {
    const load = vi.spyOn(componentCatalog[0]!, "load");
    window.history.replaceState(null, "", "/");
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("1 component");
    expect(screen.getByRole("button", { name: "Interaction" })).toHaveAttribute("aria-pressed", "false");
    expect(load).not.toHaveBeenCalled();

    const search = screen.getByRole("searchbox", { name: "Find a component" });
    await user.type(search, "INVITATION");
    expect(screen.getAllByRole("link", { name: "Explore Envelope Reveal" })).toHaveLength(1);
    expect(window.location.search).toContain("q=INVITATION");
    expect(load).not.toHaveBeenCalled();

    await user.clear(search);
    await user.type(search, "Envelope Reveal");
    expect(search).toHaveValue("Envelope Reveal");
    expect(window.location.search).toContain("q=Envelope+Reveal");
    expect(screen.getAllByRole("link", { name: "Explore Envelope Reveal" })).toHaveLength(1);
    expect(load).not.toHaveBeenCalled();

    await user.clear(search);
    const card = screen.getByRole("article");
    await user.click(within(card).getByRole("button", { name: "Reveal" }));
    expect(window.location.search).toBe("?tag=reveal");
    expect(within(card).getByRole("button", { name: "Reveal" })).toHaveAttribute("aria-pressed", "true");
    expect(load).not.toHaveBeenCalled();
  });

  it("combines accessible filters, reports empty results, and clears them", async () => {
    window.history.replaceState(null, "", "/");
    const user = userEvent.setup();
    render(<App />);

    const interaction = screen.getByRole("button", { name: "Interaction" });
    interaction.focus();
    await user.keyboard("{Enter}");
    expect(interaction).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?category=interaction");

    await user.type(screen.getByRole("searchbox", { name: "Find a component" }), "no such component");
    expect(screen.getByRole("heading", { name: "No components found" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear all filters" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 component");
    expect(window.location.search).toBe("");
  });

  it("restores category and tag state through browser back and forward", async () => {
    window.history.replaceState(null, "", "/");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Interaction" }));
    await user.click(screen.getAllByRole("button", { name: "Reveal" })[0]!);
    expect(window.location.search).toBe("?category=interaction&tag=reveal");
    expect(screen.getAllByRole("button", { name: "Reveal" })[0]).toHaveAttribute("aria-pressed", "true");

    await historyMove("back");
    expect(window.location.search).toBe("?category=interaction");
    expect(screen.getAllByRole("button", { name: "Reveal" })[0]).toHaveAttribute("aria-pressed", "false");

    await historyMove("forward");
    expect(window.location.search).toBe("?category=interaction&tag=reveal");
    expect(screen.getAllByRole("button", { name: "Reveal" })[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows component-aware FrilAdd install instructions and the alias alternative", async () => {
    const user = userEvent.setup();
    await renderDetail();

    expect(screen.getByRole("heading", { name: "Install with FrilAdd" })).toBeInTheDocument();
    expect(screen.getByText("npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --global --default")).toBeInTheDocument();
    expect(screen.getByText("npx --yes friladd@latest add envelope-reveal")).toBeInTheDocument();
    expect(screen.getByText(/Run once for a global setup/)).toBeInTheDocument();
    expect(screen.getByText(/can replace your current default/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Source Files" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Workspace Usage" })).toBeInTheDocument();

    await user.click(screen.getByText("Alternative: use the explicit Registry alias"));
    expect(screen.getByText("npx --yes friladd@latest add frilcraft/envelope-reveal")).toBeInTheDocument();
  });

  it("copies registration and install commands with independent status feedback", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    await renderDetail();

    await user.click(screen.getByRole("button", { name: "Copy FrilAdd registration command" }));
    await waitFor(() => expect(screen.getByText("Registration command copied.")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Copy Envelope Reveal install command" }));
    await waitFor(() => expect(screen.getByText("Install command copied.")).toBeInTheDocument());

    expect(writeText).toHaveBeenNthCalledWith(1, "npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --global --default");
    expect(writeText).toHaveBeenNthCalledWith(2, "npx --yes friladd@latest add envelope-reveal");
    expect(screen.getByText("Registration command copied.")).toBeInTheDocument();
  });

  it("updates the preview immediately and reset restores component defaults", async () => {
    const user = userEvent.setup();
    await renderDetail();

    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Save the date");
    expect(screen.getByText("Save the date")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Envelope color"), { target: { value: "#123456" } });
    expect(document.querySelector('[data-component="envelope-reveal"]')).toHaveStyle({ "--fc-envelope-color": "#123456" });
    expect(screen.getByRole("tabpanel")).toHaveTextContent('envelopeColor={"#123456"}');

    await user.click(screen.getByRole("button", { name: /Reset/ }));
    expect(screen.getByText("You're invited")).toBeInTheDocument();
    expect(document.querySelector('[data-component="envelope-reveal"]')).toHaveStyle({ "--fc-envelope-color": "#d9bda7" });
  });

  it("uses keyboard-accessible Radix tabs and focused property tooltips", async () => {
    const user = userEvent.setup();
    await renderDetail();

    const titleHint = screen.getByRole("button", { name: "About Title" });
    titleHint.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("The main line printed on the revealed letter.");

    const copiedSourceTab = screen.getByRole("tab", { name: "Copied Source Usage" });
    await user.click(copiedSourceTab);
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Workspace Usage" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("@frillab/interactive is private and unpublished");
  });

  it("generates valid copied-source TSX for current text and workspace TSX for the private package", async () => {
    const user = userEvent.setup();
    await renderDetail();

    const initialCode = screen.getByRole("tabpanel").textContent ?? "";
    expect(initialCode).toContain('import { EnvelopeReveal } from "./components/envelope-reveal";');
    expect(initialCode).not.toContain(".css");
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
    expect(workspaceCode).not.toContain(".css");
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
    await renderDetail();

    await user.click(screen.getByRole("tab", { name: "Source Files" }));
    expect(screen.getByText(/Copy all files into src\/components\/envelope-reveal/)).toBeInTheDocument();
    expect(screen.getByText(/Install React 19, cn, and Tailwind CSS v4/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Source file EnvelopeReveal.tsx" })).toHaveTextContent("export function EnvelopeReveal");
    expect(screen.getByRole("region", { name: "Source file index.ts" })).toHaveTextContent("./EnvelopeReveal.js");
    expect(screen.getByRole("region", { name: "Source file LICENSE" })).toHaveTextContent("Copyright (c) 2026 FrilLab");
    expect(screen.queryByText(/@frillab\/interactive/)).not.toBeInTheDocument();

    const files = [
      ["EnvelopeReveal.tsx", "export function EnvelopeReveal"],
      ["index.ts", "./EnvelopeReveal.js"],
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
    await renderDetail();

    await user.click(screen.getByRole("button", { name: "Copy local source usage" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Copy failed. Select the code in the panel and copy it manually.");
    });
  });

  it("reports clipboard failures for the install command", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("clipboard unavailable")) },
    });
    await renderDetail();

    await user.click(screen.getByRole("button", { name: "Copy Envelope Reveal install command" }));
    expect(await screen.findByText("Copy failed for install command. Select the command and copy it manually.")).toBeInTheDocument();
  });
});
