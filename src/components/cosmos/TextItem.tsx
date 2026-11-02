import { memo, useEffect, useRef, useState } from "react";
import { Ban, Minus, PaintBucket, Palette, Plus, Trash2 } from "lucide-react";
import type { CanvasItem } from "@/lib/cosmos/types";
import { FONTS, TEXT_COLORS, TEXT_SIZES } from "@/lib/cosmos/types";

const CHART = ["#1f2937", "#6b7280", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#6366f1", "#a855f7", "#ec4899"];
const BG_CHART = ["#fef3c7", "#fde2e4", "#dbeafe", "#dcfce7", "#ede9fe", "#ffedd5", "#e5e7eb", "#1f2937", "#fde047", "#86efac", "#93c5fd", "#f9a8d4"];

function ColorChart({ colors, value, onPick, label }: { colors: string[]; value?: string | undefined; onPick: (c: string) => void; label: string }) {
  return (
    <div className="note-toolbar absolute left-0 top-11 grid w-max grid-cols-6 gap-1.5 p-2" aria-label={label}>
      {colors.map((c) => (
        <button key={c} aria-label={`${label} ${c}`} onClick={() => onPick(c)}
          className={cn("size-6 rounded-full border border-border", value === c && "swatch-active")} style={{ background: c }} />
      ))}
      <label className="col-span-6 mt-1 flex cursor-pointer items-center justify-between gap-2 text-xs text-muted-foreground">
        Custom
        <input type="color" value={value?.startsWith("#") ? value : "#6366f1"} onChange={(e) => onPick(e.target.value)} className="h-6 w-10 cursor-pointer bg-transparent" />
      </label>
    </div>
  );
}
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
  const preset = TEXT_COLORS.find((c) => c.id === (item.textColor ?? "ink"));
  const colorClass = preset?.className ?? "";
  const fontClass = FONTS.find((f) => f.id === item.font)?.className ?? "font-sans";
  const [pop, setPop] = useState<null | "color" | "bg">(null);
  useEffect(() => { if (!selected) setPop(null); }, [selected]);

  const onResize = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const ow = ref.current?.offsetWidth ?? item.w;
    let started = false;
    trackDrag(e, (dx) => {
      if (!started) { checkpoint(); started = true; }
      update(item.id, { textWidth: Math.max(60, ow + dx / zoom) });
    });
  };

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
      className={cn("cosmos-text", colorClass, selected && "cosmos-text-selected", editing && "cosmos-text-editing")}
      style={{
        left: item.x, top: item.y, zIndex: item.z, fontSize: size,
        color: preset ? undefined : item.textColor,
        background: item.textBg, padding: item.textBg ? "0.25em 0.5em" : undefined,
        width: item.textWidth,
      }}
    >
      {selected && (
        <div
          data-nodrag
          className="note-toolbar absolute -top-12 left-0 z-10 flex w-max items-center gap-1 text-[15px] font-sans"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        >
          <button aria-label="Smaller text" className="tool-btn" onClick={() => setSize(-1)}><Minus className="size-4" /></button>
          <span className="w-7 text-center text-xs tabular-nums text-muted-foreground">{size}</span>
          <button aria-label="Larger text" className="tool-btn" onClick={() => setSize(1)}><Plus className="size-4" /></button>
          <span className="mx-1 h-5 w-px bg-border" />
          <select aria-label="Font" value={item.font} onChange={(e) => update(item.id, { font: e.target.value as CanvasItem["font"] }, true)} className="tool-select">
            {FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
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
          <button aria-label="Text color chart" title="More text colors" className={cn("tool-btn", pop === "color" && "icon-btn-active")} onClick={() => setPop(pop === "color" ? null : "color")}>
            <Palette className="size-4" />
          </button>
          <button aria-label="Background color" title="Background color" className={cn("tool-btn", pop === "bg" && "icon-btn-active")} onClick={() => setPop(pop === "bg" ? null : "bg")}>
            <PaintBucket className="size-4" />
          </button>
          {item.textBg && (
            <button aria-label="Remove background" title="Remove background" className="tool-btn" onClick={() => update(item.id, { textBg: undefined }, true)}>
              <Ban className="size-4" />
            </button>
          )}
          {pop === "color" && <ColorChart label="Text color" colors={CHART} value={item.textColor} onPick={(c) => update(item.id, { textColor: c }, true)} />}
          {pop === "bg" && <ColorChart label="Background" colors={BG_CHART} value={item.textBg} onPick={(c) => update(item.id, { textBg: c }, true)} />}
          <span className="mx-1 h-5 w-px bg-border" />
          <button aria-label="Delete text" className="tool-btn tool-btn-danger" onClick={() => { store.remove(item.id); onSelect(null); setEditing(null); }}>
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
      <div className={cn("cosmos-sizer", fontClass, item.textWidth && "cosmos-wrap")}>
        <span aria-hidden>{(item.text || "Type…") + " "}</span>
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
      {selected && <div data-nodrag onPointerDown={onResize} className="cosmos-resize" aria-label="Resize text box" title="Drag to resize" />}
    </div>
  );
}

export const TextItem = memo(TextItemImpl);
