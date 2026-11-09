import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ComponentCatalogEntry, ComponentDetailRegistration, PlaygroundProps, PlaygroundValue } from "./catalog/index.js";
import { componentCategories, componentTags } from "./catalog/metadata.js";
import { SiteLink } from "./navigation.js";
import {
  createFrilAddComponentCommand,
  createFrilAddQualifiedComponentCommand,
  createFrilAddRegistrationCommand,
} from "./lib/friladd.js";

type CodeView = "copied-source-usage" | "workspace-usage" | "source-files";
type InstallCopyKey = "registration" | "install" | "qualified";
const registrationCommand = createFrilAddRegistrationCommand();

/** Load a detail registration only after its route is selected. */
export function ComponentDetail({ selectedComponent }: { selectedComponent: ComponentCatalogEntry }) {
  const [attempt, setAttempt] = useState(0);
  const [loadState, setLoadState] = useState<
    | { id: string; status: "loading" }
    | { id: string; status: "loaded"; detail: ComponentDetailRegistration }
    | { id: string; status: "error" }
  >({ id: selectedComponent.id, status: "loading" });

  useEffect(() => {
    let active = true;
    setLoadState({ id: selectedComponent.id, status: "loading" });
    selectedComponent.load().then(
      (detail) => { if (active) setLoadState({ id: selectedComponent.id, status: "loaded", detail }); },
      () => { if (active) setLoadState({ id: selectedComponent.id, status: "error" }); },
    );
    return () => { active = false; };
  }, [selectedComponent, attempt]);

  if (loadState.id !== selectedComponent.id || loadState.status === "loading") {
    return <div className="mx-auto max-w-[1440px] px-5 py-24 text-sm text-muted-foreground sm:px-9 lg:px-14" role="status" aria-live="polite">Loading {selectedComponent.name}…</div>;
  }

  if (loadState.status === "error") {
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-9 lg:px-14" role="alert">
        <p className="text-[10px] uppercase tracking-[.17em] text-muted-foreground">Detail unavailable</p>
        <h1 className="mt-4 font-display text-5xl tracking-[-.05em]">Could not load {selectedComponent.name}.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">The component detail module failed to load. Check your connection and try again.</p>
        <Button className="mt-7" variant="link" onClick={() => setAttempt((value) => value + 1)}>Try again</Button>
      </div>
    );
  }

  return <ComponentDetailEditor key={selectedComponent.id} selectedComponent={selectedComponent} detail={loadState.detail} />;
}

/** Editor for one registered component; it does not own site navigation. */
function ComponentDetailEditor({
  selectedComponent,
  detail,
}: {
  selectedComponent: ComponentCatalogEntry;
  detail: ComponentDetailRegistration;
}) {
  const [values, setValues] = useState<PlaygroundProps>(detail.defaultProps);
  const [codeView, setCodeView] = useState<CodeView>("copied-source-usage");
  const [copyStatus, setCopyStatus] = useState("");
  const [installCopyStatus, setInstallCopyStatus] = useState<Partial<Record<InstallCopyKey, string>>>({});

  const usageCode = useMemo(
    () => detail.generateUsageCode(values, codeView === "workspace-usage" ? "workspace" : "source"),
    [detail, values, codeView],
  );
  const isUsageView = codeView !== "source-files";
  const installCommand = createFrilAddComponentCommand(selectedComponent.id);
  const qualifiedCommand = createFrilAddQualifiedComponentCommand(selectedComponent.id);

  const updateProperty = (key: string, value: PlaygroundValue) => {
    setValues((current) => ({ ...current, [key]: value }));
    setCopyStatus("");
  };

  const resetProperties = () => {
    setValues(detail.defaultProps);
    setCopyStatus("");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(usageCode);
      setCopyStatus(codeView === "workspace-usage" ? "Workspace usage copied." : "Copied-source usage copied.");
    } catch {
      setCopyStatus("Copy failed. Select the code in the panel and copy it manually.");
    }
  };

  const copySourceFile = async (path: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus(`${path} copied.`);
    } catch {
      setCopyStatus(`Copy failed for ${path}. Select the file contents and copy them manually.`);
    }
  };

  const copyInstallCommand = async (key: InstallCopyKey, command: string, label: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setInstallCopyStatus((current) => ({ ...current, [key]: `${label} copied.` }));
    } catch {
      setInstallCopyStatus((current) => ({
        ...current,
        [key]: `Copy failed for ${label.toLowerCase()}. Select the command and copy it manually.`,
      }));
    }
  };

  const setCodeViewAndClearStatus = (view: CodeView) => {
    setCodeView(view);
    setCopyStatus("");
  };

  const sourceFilesPanel = (
    <div className="p-5 sm:p-7">
      <p className="mb-5 max-w-4xl text-xs leading-6 text-muted-foreground">{detail.sourceInstructions}</p>
      <div className="grid gap-4">
        {detail.sourceFiles.map((file) => (
          <section className="min-w-0 border border-rule" key={file.path} aria-label={`Source file ${file.path}`}>
            <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
              <strong className="truncate font-mono text-[11px] font-normal">{file.path}</strong>
              <Button variant="link" size="sm" className="shrink-0 text-[10px]" onClick={() => copySourceFile(file.path, file.content)}>Copy {file.path}</Button>
            </div>
            <pre className="max-h-[400px] overflow-auto bg-[#f0eee8] p-4 font-mono text-[10px] leading-5"><code>{file.content}</code></pre>
          </section>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-12 sm:px-9 lg:px-14">
      <nav className="flex items-center gap-3 py-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <SiteLink className="transition-colors hover:text-ink" href="/">All components</SiteLink>
        <span aria-hidden="true">/</span>
        <span className="text-ink" aria-current="page">{selectedComponent.name}</span>
      </nav>

      <section className="flex flex-col justify-between gap-8 border-b border-rule py-10 sm:py-14 lg:flex-row lg:items-end" aria-labelledby="component-title">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[.14em] text-muted-foreground">
            <SiteLink className="text-accent hover:underline" href={`/?category=${selectedComponent.category}`}>{componentCategories[selectedComponent.category]}</SiteLink>
            {selectedComponent.tags.map((tag) => (
              <SiteLink className="hover:text-ink hover:underline" key={tag} href={`/?tag=${tag}`}>{componentTags[tag]}</SiteLink>
            ))}
          </div>
          <h1 id="component-title" className="font-display text-[clamp(3.25rem,7vw,6.5rem)] leading-[.92] tracking-[-.065em]">{selectedComponent.name}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{selectedComponent.description} Adjust the details and preview your changes instantly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[.13em] text-muted-foreground" aria-label="Technology">
          <span className="mr-2">Built with</span>
          {selectedComponent.badges.map((badge) => <Badge variant="outline" key={badge}>{badge}</Badge>)}
        </div>
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-[1.6fr_.8fr] lg:gap-7 lg:py-10" aria-label={`${selectedComponent.name} editor`}>
        <section className="min-w-0 border border-rule bg-[#fbfaf7]" aria-labelledby="preview-title">
          <div className="flex items-end justify-between border-b border-rule px-5 py-4 sm:px-7">
            <div>
              <p className="text-[9px] uppercase tracking-[.17em] text-muted-foreground">Interactive component</p>
              <h2 id="preview-title" className="mt-1 font-display text-2xl tracking-[-.035em]">Try the preview</h2>
            </div>
            <span className="hidden text-[10px] text-muted-foreground sm:inline">Live preview</span>
          </div>
          <div className="grid min-h-[390px] place-items-center overflow-hidden bg-[#f0eee8] px-5 py-12 sm:min-h-[480px] sm:px-12">
            <div className="w-full">{detail.render(values)}</div>
          </div>
          {detail.previewHint && <p className="border-t border-rule px-5 py-3 text-[11px] text-muted-foreground sm:px-7">{detail.previewHint}</p>}
          {detail.previewFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-rule px-5 py-3 text-muted-foreground sm:px-7">
              {detail.previewFeatures.map((feature) => <Badge variant="muted" key={feature}>{feature}</Badge>)}
            </div>
          )}
        </section>

        <aside className="border border-rule bg-[#fbfaf7]" aria-labelledby="controls-title">
          <div className="flex items-end justify-between border-b border-rule px-5 py-4">
            <div>
              <p className="text-[9px] uppercase tracking-[.17em] text-muted-foreground">Customize</p>
              <h2 id="controls-title" className="mt-1 font-display text-2xl tracking-[-.035em]">Properties</h2>
            </div>
            <Button variant="link" size="sm" className="text-muted-foreground" onClick={resetProperties}>Reset</Button>
          </div>
          <div className="divide-y divide-rule px-5">
            {detail.controls.map((control) => {
              const value = values[String(control.key)];
              const stringValue = typeof value === "string" ? value : value === undefined ? "" : String(value);
              return (
                <div className="grid gap-2 py-4 text-xs" key={String(control.key)}>
                  <div className="flex items-center gap-1.5">
                    <label className="text-muted-foreground" htmlFor={`${selectedComponent.id}-${String(control.key)}`}>{control.label}</label>
                    {control.description && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 rounded-full border border-rule text-[9px] text-muted-foreground hover:border-ink hover:bg-transparent hover:text-ink"
                            aria-label={`About ${control.label}`}
                          >
                            i
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{control.description}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {control.kind === "textarea" ? (
                    <Textarea id={`${selectedComponent.id}-${String(control.key)}`} className="min-h-20 resize-y" value={stringValue} rows={3} maxLength={240} onChange={(event) => updateProperty(String(control.key), event.target.value)} />
                  ) : control.kind === "color" ? (
                    <span className="flex items-center gap-3">
                      <Input id={`${selectedComponent.id}-${String(control.key)}`} className="h-9 w-12 cursor-pointer border-0 bg-transparent p-0 focus-visible:ring-0" type="color" value={stringValue} onChange={(event) => updateProperty(String(control.key), event.target.value)} />
                      <span className="font-mono text-[11px] text-muted-foreground">{stringValue.toUpperCase()}</span>
                    </span>
                  ) : control.kind === "boolean" ? (
                    <Input id={`${selectedComponent.id}-${String(control.key)}`} className="size-4 accent-ink" type="checkbox" checked={value === true} onChange={(event) => updateProperty(String(control.key), event.target.checked)} />
                  ) : control.kind === "number" ? (
                    <Input id={`${selectedComponent.id}-${String(control.key)}`} type="number" value={typeof value === "number" ? value : ""} step="any" onChange={(event) => {
                      const nextValue = event.target.value === "" ? undefined : event.target.valueAsNumber;
                      updateProperty(String(control.key), typeof nextValue === "number" && Number.isFinite(nextValue) ? nextValue : undefined);
                    }} />
                  ) : (
                    <Input id={`${selectedComponent.id}-${String(control.key)}`} type="text" value={stringValue} maxLength={120} onChange={(event) => updateProperty(String(control.key), event.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="border-t border-rule px-5 py-4 text-[11px] leading-5 text-muted-foreground">Changes are reflected in the preview and usage code.</p>
        </aside>
      </section>

      <section className="border border-rule bg-[#fbfaf7]" aria-labelledby="code-title">
        <div className="flex flex-col justify-between gap-4 border-b border-rule px-5 py-5 sm:flex-row sm:items-end sm:px-7">
          <div>
            <p className="text-[9px] uppercase tracking-[.17em] text-muted-foreground">Take it with you</p>
            <h2 id="code-title" className="mt-1 font-display text-3xl tracking-[-.04em]">Use it in your project</h2>
          </div>
          {isUsageView && (
            <Button className="self-start sm:self-auto" variant="outline" onClick={copyCode}>
              Copy {codeView === "workspace-usage" ? "workspace" : "local source"} usage
            </Button>
          )}
        </div>

        <section className="border-b border-rule px-5 py-6 sm:px-7" aria-labelledby="friladd-install-title">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] uppercase tracking-[.16em] text-muted-foreground">Recommended installer</p>
              <Badge variant="outline">FrilAdd latest</Badge>
            </div>
            <h3 id="friladd-install-title" className="mt-1 font-display text-2xl tracking-[-.035em]">Install with FrilAdd</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">FrilAdd copies component files only. Add React, <code className="font-mono">cn</code>, and Tailwind CSS v4 with <code className="font-mono">@tailwindcss/vite</code>; the CLI does not install dependencies or configure Tailwind.</p>
          </div>
          {selectedComponent.installable ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] uppercase tracking-[.13em] text-muted-foreground">Step 1 · Register FrilCraft</p>
                <div className="flex min-w-0 items-start gap-3 border border-rule bg-paper p-3">
                  <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-5">{registrationCommand}</pre>
                  <Button variant="link" size="sm" className="shrink-0 text-[10px]" aria-label="Copy FrilAdd registration command" onClick={() => copyInstallCommand("registration", registrationCommand, "Registration command")}>Copy</Button>
                </div>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">Run once for a global setup. <code>--global</code> makes the Registry available across projects; <code>--default</code> sets it as your default and can replace your current default. Omit <code>--default</code> to keep that selection.</p>
                <span className="mt-1 block min-h-4 text-[10px] text-muted-foreground" aria-live="polite">{installCopyStatus.registration ?? ""}</span>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-[10px] uppercase tracking-[.13em] text-muted-foreground">Step 2 · Install {selectedComponent.name}</p>
                <div className="flex min-w-0 items-start gap-3 border border-rule bg-paper p-3">
                  <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-5">{installCommand}</pre>
                  <Button variant="link" size="sm" className="shrink-0 text-[10px]" aria-label={`Copy ${selectedComponent.name} install command`} onClick={() => copyInstallCommand("install", installCommand, "Install command")}>Copy</Button>
                </div>
                <span className="mt-1 block min-h-4 text-[10px] text-muted-foreground" aria-live="polite">{installCopyStatus.install ?? ""}</span>
                <details className="mt-3 border-t border-rule pt-3 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-ink">Alternative: use the explicit Registry alias</summary>
                  <p className="py-3 text-[10px] leading-5 text-muted-foreground">Use this after registering FrilCraft when you do not want it to be your default Registry.</p>
                  <div className="flex min-w-0 items-start gap-3 border border-rule bg-paper p-3">
                    <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-5">{qualifiedCommand}</pre>
                    <Button variant="link" size="sm" className="shrink-0 text-[10px]" aria-label={`Copy ${selectedComponent.name} qualified install command`} onClick={() => copyInstallCommand("qualified", qualifiedCommand, "Qualified install command")}>Copy</Button>
                  </div>
                  <span className="mt-1 block min-h-4 text-[10px] text-muted-foreground" aria-live="polite">{installCopyStatus.qualified ?? ""}</span>
                </details>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-xs text-muted-foreground">This preview is not registered in the FrilCraft Registry, so it cannot be installed with FrilAdd yet.</p>
          )}
        </section>

        <Tabs
          value={codeView}
          onValueChange={(value) => setCodeViewAndClearStatus(value as CodeView)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule px-5 py-3 sm:px-7">
            <TabsList aria-label="Code type">
              <TabsTrigger value="copied-source-usage">Copied Source Usage</TabsTrigger>
              <TabsTrigger value="workspace-usage">Workspace Usage</TabsTrigger>
              <TabsTrigger value="source-files">Source Files</TabsTrigger>
            </TabsList>
            <span className="text-[9px] uppercase tracking-[.13em] text-muted-foreground">{isUsageView ? "TSX" : `${detail.sourceFiles.length} files`}</span>
          </div>
          <TabsContent value="copied-source-usage">
            <pre className="max-h-[440px] overflow-auto bg-[#f0eee8] p-5 font-mono text-[11px] leading-6 text-ink sm:p-7"><code>{usageCode}</code></pre>
          </TabsContent>
          <TabsContent value="workspace-usage">
            <pre className="max-h-[440px] overflow-auto bg-[#f0eee8] p-5 font-mono text-[11px] leading-6 text-ink sm:p-7"><code>{usageCode}</code></pre>
          </TabsContent>
          <TabsContent value="source-files">{sourceFilesPanel}</TabsContent>
        </Tabs>
        <div className="border-t border-rule px-5 py-3 text-[10px] leading-5 text-muted-foreground sm:px-7">
          <span role="status" aria-live="polite">{copyStatus || (codeView === "workspace-usage"
            ? "Workspace Usage imports the private, unpublished @frillab/interactive package."
            : codeView === "copied-source-usage"
              ? "Copied Source Usage imports local component files and is the external usage example."
              : "Copy the listed files individually; the LICENSE file preserves the MIT notice.")}</span>
        </div>
      </section>
    </div>
  );
}
