import { memo, useEffect, useRef } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CanvasItem } from "@/lib/cosmos/types";
import { TEXT_COLORS, TEXT_SIZES } from "@/lib/cosmos/types";
import type { CosmosStore } from "@/lib/cosmos/useCosmosStore";
import { trackDrag } from "@/lib/cosmos/drag";
import { cn } from "@/lib/utils";

interface Props {
  item: CanvasItem;
  zoom: number;
  selected: boolean;
  editing: boolean;
  onSelect: (id: string | null) => void;
  setEditing: (id: string | null) => void;
  store: Pick<CosmosStore, "update" | "remove" | "bringToFront" | "checkpoint">;
}

/** Free-floating text on the canvas: transparent, auto-sized, drag to move, click to edit. */
function TextItemImpl({ item, zoom, selected, editing, onSelect, setEditing, store }: Props) {
  const { update, checkpoint } = store;
  const ref = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const size = item.fontSize ?? 24;
  const colorClass = TEXT_COLORS.find((c) => c.id === item.textColor)?.className ?? "text-foreground";

  useEffect(() => {
    if (editing) requestAnimationFrame(() => { taRef.current?.focus(); });
  }, [editing]);

  // Keep stored w/h in sync with rendered size (used by minimap and fit-to-content).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    if (Math.abs(w - item.w) > 1 || Math.abs(h - item.h) > 1) update(item.id, { w, h });
  }, [item.text, size, item.id, item.w, item.h, update]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(item.id);
    store.bringToFront(item.id);
    if (editing || (e.target as HTMLElement).closest("[data-nodrag]")) return;
    e.preventDefault();
    const ox = item.x, oy = item.y;
    let started = false;
    trackDrag(
      e,
      (dx, dy) => {
        if (!started) { checkpoint(); started = true; }
        update(item.id, { x: ox + dx / zoom, y: oy + dy / zoom });
      },
      (moved) => { if (!moved && selected) setEditing(item.id); },
    );
  };

  const setSize = (dir: 1 | -1) => {
    const idx = TEXT_SIZES.findIndex((s) => s >= size);
    const next = TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, Math.max(0, (idx < 0 ? TEXT_SIZES.length - 1 : idx) + dir))];
    update(item.id, { fontSize: next }, true);
  };

  return (
    <div
      ref={ref}
      data-item={item.id}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(item.id); }}
      className={cn("text-item", colorClass, selected && "text-selected", editing && "text-editing")}
      style={{ left: item.x, top: item.y, zIndex: item.z, fontSize: size }}
    >
      {selected && (
        <div
          data-nodrag
          className="note-toolbar absolute -top-12 left-0 flex items-center gap-1 text-[15px]"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        >
          <button aria-label="Smaller text" className="tool-btn" onClick={() => setSize(-1)}><Minus className="size-4" /></button>
          <span className="w-7 text-center text-xs tabular-nums text-muted-foreground">{size}</span>
          <button aria-label="Larger text" className="tool-btn" onClick={() => setSize(1)}><Plus className="size-4" /></button>
          <span className="mx-1 h-5 w-px bg-border" />
          {TEXT_COLORS.map((c) => (
            <button
              key={c.id}
              aria-label={`Text color ${c.id}`}
              onClick={() => update(item.id, { textColor: c.id }, true)}
              className={cn("swatch grid place-items-center", c.className, item.textColor === c.id && "swatch-active")}
            >
              <span className="text-sm font-bold">A</span>
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          <button aria-label="Delete text" className="tool-btn tool-btn-danger" onClick={() => { store.remove(item.id); onSelect(null); setEditing(null); }}>
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
      <div className="text-sizer font-sans">
        <span aria-hidden>{item.text + " "}</span>
        <textarea
          ref={taRef}
          aria-label="Text"
          value={item.text}
          rows={1}
          placeholder="Type…"
          readOnly={!editing}
          tabIndex={editing ? 0 : -1}
          style={{ pointerEvents: editing ? "auto" : "none" }}
          onFocus={checkpoint}
          onBlur={() => {
            setEditing(null);
            if (!item.text.trim()) { store.remove(item.id, false); onSelect(null); }
          }}
          onChange={(e) => update(item.id, { text: e.target.value })}
        />
      </div>
    </div>
  );
}

export const TextItem = memo(TextItemImpl);
