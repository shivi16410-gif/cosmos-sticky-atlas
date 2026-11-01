import { memo, useRef } from "react";
import { CalendarDays, Copy, Lightbulb, ListChecks, Plus, StickyNote, Target, Trash2, X } from "lucide-react";
import type { CanvasItem, CheckItem } from "@/lib/cosmos/types";
import { COLOR_CLASS, FONTS, NOTE_COLORS, uid } from "@/lib/cosmos/types";
import type { CosmosStore } from "@/lib/cosmos/useCosmosStore";
import { trackDrag } from "@/lib/cosmos/drag";
import { cn } from "@/lib/utils";

const TYPE_META = {
  note: { icon: StickyNote, label: "Note" },
  idea: { icon: Lightbulb, label: "Idea" },
  goal: { icon: Target, label: "Goal" },
  checklist: { icon: ListChecks, label: "Checklist" },
  calendar: { icon: CalendarDays, label: "Calendar" },
  text: { icon: StickyNote, label: "Text" },
} as const;

interface Props {
  item: CanvasItem;
  zoom: number;
  selected: boolean;
  onSelect: (id: string | null) => void;
  store: Pick<CosmosStore, "update" | "remove" | "duplicate" | "bringToFront" | "checkpoint">;
}

function NoteItemImpl({ item, zoom, selected, onSelect, store }: Props) {
  const { update, checkpoint } = store;
  const Meta = TYPE_META[item.type];
  const fontClass = FONTS.find((f) => f.id === item.font)?.className ?? "font-sans";
  const listRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(item.id);
    store.bringToFront(item.id);
    if ((e.target as HTMLElement).closest("textarea,input,button,[data-nodrag]")) return;
    e.preventDefault();
    const ox = item.x, oy = item.y;
    let started = false;
    trackDrag(e, (dx, dy) => {
      if (!started) { checkpoint(); started = true; }
      update(item.id, { x: ox + dx / zoom, y: oy + dy / zoom });
    });
  };

  const onResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    const ow = item.w, oh = item.h;
    let started = false;
    trackDrag(e, (dx, dy) => {
      if (!started) { checkpoint(); started = true; }
      update(item.id, { w: Math.max(160, ow + dx / zoom), h: Math.max(120, oh + dy / zoom) });
    });
  };

  const setList = (list: CheckItem[], record = true) => update(item.id, { checklist: list }, record);
  const list = item.checklist ?? [];
  const done = list.filter((c) => c.done).length;

  const addRow = (afterIdx?: number) => {
    const row = { id: uid(), text: "", done: false };
    const next = [...list];
    next.splice(afterIdx === undefined ? next.length : afterIdx + 1, 0, row);
    setList(next);
    requestAnimationFrame(() =>
      listRef.current?.querySelector<HTMLInputElement>(`[data-row="${row.id}"]`)?.focus(),
    );
  };

  return (
    <div
      data-item={item.id}
      onPointerDown={onPointerDown}
      className={cn(
        "note-card group absolute flex flex-col",
        COLOR_CLASS[item.color],
        selected && "note-selected",
      )}
      style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: item.z }}
    >
      {selected && (
        <div
          data-nodrag
          className="note-toolbar absolute -top-12 left-0 flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Color ${c}`}
              onClick={() => update(item.id, { color: c }, true)}
              className={cn("swatch", COLOR_CLASS[c], item.color === c && "swatch-active")}
            />
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          <select
            aria-label="Font"
            value={item.font}
            onChange={(e) => update(item.id, { font: e.target.value as CanvasItem["font"] }, true)}
            className="tool-select"
          >
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <button aria-label="Duplicate" className="tool-btn" onClick={() => { const id = store.duplicate(item.id); if (id) onSelect(id); }}>
            <Copy className="size-4" />
          </button>
          <button aria-label="Delete note" className="tool-btn tool-btn-danger" onClick={() => { store.remove(item.id); onSelect(null); }}>
            <Trash2 className="size-4" />
          </button>
        </div>
      )}

      <div className="flex cursor-grab items-center justify-between px-3 pt-2.5 pb-1 active:cursor-grabbing">
        <span className="note-tag">
          <Meta.icon className="size-3.5" /> {Meta.label}
        </span>
        {item.type === "checklist" && list.length > 0 && (
          <span className="note-tag">{done}/{list.length}</span>
        )}
      </div>

      {item.type === "checklist" ? (
        <div className={cn("flex min-h-0 flex-1 flex-col px-3 pb-3", fontClass)}>
          <input
            value={item.text}
            placeholder="List title"
            onFocus={checkpoint}
            onChange={(e) => update(item.id, { text: e.target.value })}
            className="note-input mb-1 text-lg font-semibold"
          />
          <div ref={listRef} className="min-h-0 flex-1 space-y-0.5 overflow-auto">
            {list.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.done}
                  aria-label="Mark complete"
                  onChange={() => setList(list.map((r) => (r.id === c.id ? { ...r, done: !r.done } : r)))}
                  className="note-check"
                />
                <input
                  data-row={c.id}
                  value={c.text}
                  placeholder="Task…"
                  onFocus={checkpoint}
                  onChange={(e) => setList(list.map((r) => (r.id === c.id ? { ...r, text: e.target.value } : r)), false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addRow(idx); }
                    if (e.key === "Backspace" && c.text === "" && list.length > 1) {
                      e.preventDefault();
                      setList(list.filter((r) => r.id !== c.id));
                    }
                  }}
                  className={cn("note-input flex-1", c.done && "line-through opacity-50")}
                />
                <button aria-label="Remove task" className="opacity-0 transition group-hover:opacity-50 hover:opacity-100" onClick={() => setList(list.filter((r) => r.id !== c.id))}>
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => addRow()} className="note-add mt-1">
            <Plus className="size-3.5" /> Add task
          </button>
        </div>
      ) : (
        <textarea
          value={item.text}
          placeholder={item.type === "goal" ? "What do you want to achieve?" : item.type === "idea" ? "Capture an idea…" : "Write something…"}
          onFocus={checkpoint}
          onChange={(e) => update(item.id, { text: e.target.value })}
          className={cn(
            "note-input min-h-0 flex-1 resize-none px-3 pb-3",
            fontClass,
            item.font === "hand" || item.font === "marker" ? "text-xl leading-snug" : "text-[15px] leading-relaxed",
            item.type === "goal" && "font-semibold",
          )}
        />
      )}

      <div data-nodrag onPointerDown={onResize} className="resize-handle" aria-label="Resize" />
    </div>
  );
}

export const NoteItem = memo(NoteItemImpl);
