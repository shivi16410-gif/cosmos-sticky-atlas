import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, MAX_ZOOM, MIN_ZOOM, clamp } from "@/components/cosmos/Canvas";
import type { CanvasTool } from "@/components/cosmos/Canvas";
import { TopBar, Toolbar, ZoomControls } from "@/components/cosmos/Chrome";
import { Minimap } from "@/components/cosmos/Minimap";
import { useCosmosStore } from "@/lib/cosmos/useCosmosStore";
import { useChromeVisibility } from "@/lib/cosmos/useChromeVisibility";
import { useTheme } from "@/lib/cosmos/useTheme";
import type { ItemType } from "@/lib/cosmos/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COSMOS — Infinite canvas for your thoughts" },
      { name: "description", content: "Organize ideas, goals, checklists and plans on an infinite whiteboard canvas." },
      { property: "og:title", content: "COSMOS — Infinite canvas for your thoughts" },
      { property: "og:description", content: "Organize ideas, goals, checklists and plans on an infinite whiteboard canvas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CosmosApp,
});

function CosmosApp() {
  const store = useCosmosStore();
  const { theme, toggle } = useTheme();
  const { dimmed, focusMode, toggleFocusMode } = useChromeVisibility();
  const [selected, setSelected] = useState<string | null>(null);
  const [tool, setTool] = useState<CanvasTool>(null);
  const [drawColor, setDrawColor] = useState("#7c3aed");
  const [drawWidth, setDrawWidth] = useState(4);
  const [editing, setEditing] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const { view, setView, items } = store;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const create = (type: ItemType) => {
    const n = items.length % 6;
    const cx = (size.w / 2 - view.x) / view.zoom + n * 18;
    const cy = (size.h / 2 - view.y) / view.zoom + n * 18;
    setSelected(store.add(type, cx, cy));
  };

  const zoomBy = (f: number) =>
    setView((v) => {
      const next = clamp(v.zoom * f, MIN_ZOOM, MAX_ZOOM), k = next / v.zoom;
      const px = size.w / 2, py = size.h / 2;
      return { zoom: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });

  const fit = useCallback(() => {
    if (!items.length) return setView({ x: 0, y: 0, zoom: 1 });
    const minX = Math.min(...items.map((i) => i.x)), minY = Math.min(...items.map((i) => i.y));
    const maxX = Math.max(...items.map((i) => i.x + i.w)), maxY = Math.max(...items.map((i) => i.y + i.h));
    const pad = 120;
    const zoom = clamp(Math.min(size.w / (maxX - minX + pad * 2), (size.h - 120) / (maxY - minY + pad * 2)), MIN_ZOOM, 1.5);
    setView({ zoom, x: size.w / 2 - ((minX + maxX) / 2) * zoom, y: size.h / 2 - ((minY + maxY) / 2) * zoom });
  }, [items, size, setView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT";
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) store.redo(); else store.undo();
      } else if (mod && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault(); store.redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selected && !typing) {
        e.preventDefault(); store.remove(selected); setSelected(null);
      } else if (e.key === "Escape") {
        if (editing) { setEditing(null); (document.activeElement as HTMLElement | null)?.blur?.(); return; }
        if (tool) { setTool(null); return; }
        setSelected(null); (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, selected, editing, tool]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <Canvas store={store} selected={selected} setSelected={setSelected} containerRef={containerRef}
        tool={tool} editing={editing} setEditing={setEditing} drawColor={drawColor} drawWidth={drawWidth} />
      <TopBar store={store} theme={theme} onToggleTheme={toggle} dimmed={dimmed} focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />
      {!focusMode && (
        <>
          <Toolbar onCreate={create} dimmed={dimmed} tool={tool} onTool={setTool} drawColor={drawColor} setDrawColor={setDrawColor} drawWidth={drawWidth} setDrawWidth={setDrawWidth} />
          <ZoomControls zoom={view.zoom} onZoom={zoomBy} onFit={fit} dimmed={dimmed} />
          {store.settings.showMinimap && (
            <Minimap items={items} view={view} size={size} dimmed={dimmed}
              onCenter={(x, y) => setView((v) => ({ ...v, x: size.w / 2 - x * v.zoom, y: size.h / 2 - y * v.zoom }))} />
          )}
        </>
      )}
      {store.loaded && items.length === 0 && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-hand text-2xl text-muted-foreground">
          Double‑click anywhere, or pick a tool below to begin.
        </p>
      )}
    </main>
  );
}
