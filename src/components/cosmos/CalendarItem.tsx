import { memo, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Copy, RefreshCw, Trash2 } from "lucide-react";
import type { CanvasItem } from "@/lib/cosmos/types";
import type { CosmosStore } from "@/lib/cosmos/useCosmosStore";
import { trackDrag } from "@/lib/cosmos/drag";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

interface Props {
  item: CanvasItem;
  zoom: number;
  selected: boolean;
  onSelect: (id: string | null) => void;
  store: Pick<CosmosStore, "update" | "remove" | "duplicate" | "bringToFront" | "checkpoint">;
}

function CalendarItemImpl({ item, zoom, selected, onSelect, store }: Props) {
  const { update, checkpoint } = store;
  const now = new Date();
  const follow = item.calFollow ?? true;
  const year = follow ? now.getFullYear() : (item.calYear ?? now.getFullYear());
  const month = follow ? now.getMonth() : (item.calMonth ?? now.getMonth());

  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const total = daysInMonth(year, month);
    const prevTotal = daysInMonth(year, month - 1);
    const out: { day: number; outside: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) out.push({ day: prevTotal - i, outside: true });
    for (let d = 1; d <= total; d++) out.push({ day: d, outside: false });
    while (out.length % 7 !== 0) out.push({ day: out.length - first - total + 1, outside: true });
    return out;
  }, [year, month]);

  const shift = (delta: number) => {
    const m = month + delta;
    update(item.id, {
      calFollow: false,
      calYear: year + Math.floor(m / 12),
      calMonth: ((m % 12) + 12) % 12,
    }, true);
  };

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(item.id);
    store.bringToFront(item.id);
    if ((e.target as HTMLElement).closest("button,[data-nodrag]")) return;
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
      update(item.id, { w: Math.max(240, ow + dx / zoom), h: Math.max(280, oh + dy / zoom) });
    });
  };

  return (
    <div
      data-item={item.id}
      onPointerDown={onPointerDown}
      className={cn("cal-card group absolute flex flex-col", selected && "note-selected")}
      style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: item.z }}
    >
      {selected && (
        <div
          data-nodrag
          className="note-toolbar absolute -top-12 left-0 flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Follow current month"
            aria-pressed={follow}
            title="Follow current month"
            className={cn("tool-btn", follow && "text-primary")}
            onClick={() => update(item.id, { calFollow: !follow }, true)}
          >
            <RefreshCw className="size-4" />
          </button>
          <button aria-label="Duplicate" className="tool-btn" onClick={() => { const id = store.duplicate(item.id); if (id) onSelect(id); }}>
            <Copy className="size-4" />
          </button>
          <button aria-label="Delete calendar" className="tool-btn tool-btn-danger" onClick={() => { store.remove(item.id); onSelect(null); }}>
            <Trash2 className="size-4" />
          </button>
        </div>
      )}

      {/* dusty-pink decorative doodles */}
      <svg className="cal-doodle pointer-events-none absolute -right-2 -top-2 size-14" viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="40" cy="24" r="14" fill="currentColor" opacity="0.35" />
        <path d="M8 44c6-8 14-8 20-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <svg className="cal-doodle pointer-events-none absolute -bottom-1 -left-1 size-12" viewBox="0 0 56 56" fill="none" aria-hidden>
        <path d="M10 40q8-14 18-8t16-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="4" fill="currentColor" opacity="0.4" />
      </svg>

      <div className="relative flex cursor-grab items-center justify-between px-3 pt-2.5 active:cursor-grabbing">
        <span className="note-tag">
          <CalendarDays className="size-3.5" /> Calendar
        </span>
        <div data-nodrag className="flex items-center" onPointerDown={(e) => e.stopPropagation()}>
          <button className="icon-btn !size-7" aria-label="Previous month" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </button>
          <button className="icon-btn !size-7" aria-label="Next month" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <h2 className="cal-heading relative px-3 text-center font-hand text-3xl leading-tight">
        {MONTHS[month]} <span className="text-xl opacity-70">{year}</span>
      </h2>

      <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 pt-1">
        <div className="grid grid-cols-7 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal-weekday text-[0.65rem] font-bold uppercase tracking-wider">{w}</span>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
          {cells.map((c, i) => (
            <span key={i} className="flex items-center justify-center">
              <span
                className={cn(
                  "cal-day flex size-7 items-center justify-center rounded-full text-[0.8rem] tabular-nums",
                  c.outside && "cal-day-outside",
                  !c.outside && isToday(c.day) && "cal-today",
                )}
              >
                {c.day}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div data-nodrag onPointerDown={onResize} className="resize-handle" aria-label="Resize" />
    </div>
  );
}

export const CalendarItem = memo(CalendarItemImpl);
