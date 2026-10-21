import { useEffect, useRef } from "react";
import type { CosmosStore } from "@/lib/cosmos/useCosmosStore";
import { trackDrag } from "@/lib/cosmos/drag";
import { NoteItem } from "./NoteItem";
import { cn } from "@/lib/utils";

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 1.35; // zoom buttons
export const WHEEL_ZOOM_INTENSITY = 0.004; // wheel/pinch sensitivity
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface Props {
  store: CosmosStore;
  selected: string | null;
  setSelected: (id: string | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function Canvas({ store, selected, setSelected, containerRef }: Props) {
  const { view, setView, items, settings } = store;
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("textarea,.overflow-auto") && !e.ctrlKey) return;
      e.preventDefault();
      const v = viewRef.current;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const next = clamp(v.zoom * Math.exp(-dy * WHEEL_ZOOM_INTENSITY), MIN_ZOOM, MAX_ZOOM);
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const k = next / v.zoom;
      setView({ zoom: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, setView]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    setSelected(null);
    (document.activeElement as HTMLElement | null)?.blur?.();
    e.preventDefault();
    const ox = view.x, oy = view.y;
    containerRef.current?.classList.add("is-panning");
    trackDrag(
      e,
      (dx, dy) => setView((v) => ({ ...v, x: ox + dx, y: oy + dy })),
      () => containerRef.current?.classList.remove("is-panning"),
    );
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left - view.x) / view.zoom;
    const cy = (e.clientY - rect.top - view.y) / view.zoom;
    setSelected(store.add("note", cx, cy));
  };

  const grid = 24 * view.zoom;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className={cn("canvas-surface absolute inset-0 overflow-hidden", settings.showGrid && "canvas-grid")}
      style={{ backgroundSize: `${grid}px ${grid}px`, backgroundPosition: `${view.x}px ${view.y}px` }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
      >
        <div className="pointer-events-auto">
          {items.map((item) => (
            <NoteItem
              key={item.id}
              item={item}
              zoom={view.zoom}
              selected={selected === item.id}
              onSelect={setSelected}
              store={store}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
