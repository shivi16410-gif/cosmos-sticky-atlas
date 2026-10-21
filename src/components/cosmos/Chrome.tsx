import { useEffect, useRef, useState } from "react";
import {
  Check, Download, Lightbulb, ListChecks, Loader2, Maximize, Minus, Moon, Plus, Redo2,
  Settings as SettingsIcon, StickyNote, Sun, Target, Trash2, Undo2,
} from "lucide-react";
import type { ItemType } from "@/lib/cosmos/types";
import type { CosmosStore } from "@/lib/cosmos/useCosmosStore";
import { cn } from "@/lib/utils";

export function TopBar({ store, theme, onToggleTheme }: { store: CosmosStore; theme: string; onToggleTheme: () => void }) {
  return (
    <header className="panel absolute inset-x-3 top-3 z-[100000] flex h-14 items-center justify-between px-4">
      <div className="flex items-center gap-2.5">
        <span className="logo-mark" aria-hidden />
        <span className="font-display text-xl tracking-[0.18em]">COSMOS</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="mr-2 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex" aria-live="polite">
          {store.status === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {store.status === "saving" ? "Saving…" : "Saved"}
        </span>
        <IconBtn label="Undo (Ctrl+Z)" onClick={store.undo} disabled={!store.canUndo}><Undo2 className="size-4" /></IconBtn>
        <IconBtn label="Redo (Ctrl+Shift+Z)" onClick={store.redo} disabled={!store.canRedo}><Redo2 className="size-4" /></IconBtn>
        <span className="mx-1 h-6 w-px bg-border" />
        <IconBtn label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggleTheme}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </IconBtn>
        <SettingsMenu store={store} />
      </div>
    </header>
  );
}

function IconBtn({ label, children, active, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button aria-label={label} title={label} className={cn("icon-btn", active && "icon-btn-active")} {...rest}>
      {children}
    </button>
  );
}

function SettingsMenu({ store }: { store: CosmosStore }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  const { settings, setSettings } = store;
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ items: store.items }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cosmos-board.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div ref={ref} className="relative">
      <IconBtn label="Settings" onClick={() => setOpen((o) => !o)} active={open}><SettingsIcon className="size-4" /></IconBtn>
      {open && (
        <div className="panel menu-pop absolute right-0 top-12 w-60 p-1.5">
          <MenuToggle label="Show dot grid" on={settings.showGrid} onClick={() => setSettings({ ...settings, showGrid: !settings.showGrid })} />
          <MenuToggle label="Show minimap" on={settings.showMinimap} onClick={() => setSettings({ ...settings, showMinimap: !settings.showMinimap })} />
          <div className="my-1 h-px bg-border" />
          <button className="menu-item" onClick={exportJson}><Download className="size-4" /> Export board (JSON)</button>
          <button
            className="menu-item text-destructive"
            onClick={() => { if (confirm("Clear every item from the board? You can undo this.")) { store.clear(); setOpen(false); } }}
          >
            <Trash2 className="size-4" /> Clear board
          </button>
        </div>
      )}
    </div>
  );
}

function MenuToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button className="menu-item justify-between" onClick={onClick} role="switch" aria-checked={on}>
      {label}
      <span className={cn("switch", on && "switch-on")}><span /></span>
    </button>
  );
}

const TOOLS: { type: ItemType; label: string; icon: typeof StickyNote }[] = [
  { type: "note", label: "Note", icon: StickyNote },
  { type: "idea", label: "Idea", icon: Lightbulb },
  { type: "goal", label: "Goal", icon: Target },
  { type: "checklist", label: "Checklist", icon: ListChecks },
];

export function Toolbar({ onCreate }: { onCreate: (t: ItemType) => void }) {
  return (
    <nav className="panel absolute left-1/2 bottom-4 z-[100000] flex -translate-x-1/2 gap-1 p-1.5" aria-label="Create">
      {TOOLS.map((t) => (
        <button key={t.type} className="tool-create" onClick={() => onCreate(t.type)}>
          <t.icon className="size-4" />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function ZoomControls({ zoom, onZoom, onFit }: { zoom: number; onZoom: (f: number) => void; onFit: () => void }) {
  return (
    <div className="panel absolute bottom-4 left-4 z-[100000] flex items-center gap-0.5 p-1">
      <IconBtn label="Zoom out" onClick={() => onZoom(1 / 1.2)}><Minus className="size-4" /></IconBtn>
      <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
      <IconBtn label="Zoom in" onClick={() => onZoom(1.2)}><Plus className="size-4" /></IconBtn>
      <IconBtn label="Fit to content" onClick={onFit}><Maximize className="size-4" /></IconBtn>
    </div>
  );
}
