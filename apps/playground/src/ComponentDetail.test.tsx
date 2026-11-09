import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComponentDetail } from "./ComponentDetail.js";
import type { ComponentCatalogEntry, ComponentDetailRegistration } from "./catalog/index.js";

function makeDetail(label: string): ComponentDetailRegistration {
  return {
    defaultProps: {},
    controls: [],
    previewFeatures: [],
    sourceFiles: [],
    sourceInstructions: "",
    render: () => <span>{label} preview</span>,
    generateUsageCode: () => "",
  };
}

function makeEntry(id: string, name: string, load: ComponentCatalogEntry["load"]): ComponentCatalogEntry {
  return {
    id,
    name,
    description: `${name} component`,
    category: "interaction",
    tags: ["reveal"],
    badges: [],
    installable: false,
    load,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("lazy component detail", () => {
  it("shows a loading state until its detail module resolves", async () => {
    const request = deferred<ComponentDetailRegistration>();
    const entry = makeEntry("sample", "Sample", () => request.promise);
    render(<ComponentDetail selectedComponent={entry} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Sample");
    await act(async () => request.resolve(makeDetail("Sample")));
    expect(await screen.findByText("Sample preview")).toBeInTheDocument();
  });

  it("offers a retry when the detail module fails to load", async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(makeDetail("Retry"));
    const entry = makeEntry("retry", "Retry", load);
    render(<ComponentDetail selectedComponent={entry} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load Retry");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Retry preview")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not show an old module after a rapid route change", async () => {
    const firstRequest = deferred<ComponentDetailRegistration>();
    const secondRequest = deferred<ComponentDetailRegistration>();
    const first = makeEntry("first", "First", () => firstRequest.promise);
    const second = makeEntry("second", "Second", () => secondRequest.promise);
    const view = render(<ComponentDetail selectedComponent={first} />);

    view.rerender(<ComponentDetail selectedComponent={second} />);
    await act(async () => secondRequest.resolve(makeDetail("Second")));
    expect(await screen.findByText("Second preview")).toBeInTheDocument();

    await act(async () => firstRequest.resolve(makeDetail("First")));
    expect(screen.queryByText("First preview")).not.toBeInTheDocument();
    expect(screen.getByText("Second preview")).toBeInTheDocument();
  });
});
