import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function CalendarPanel({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1).getDay();
    const total = daysInMonth(view.year, view.month);
    const prevTotal = daysInMonth(view.year, view.month - 1);
    const out: { day: number; outside: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) out.push({ day: prevTotal - i, outside: true });
    for (let d = 1; d <= total; d++) out.push({ day: d, outside: false });
    while (out.length % 7 !== 0) out.push({ day: out.length - first - total + 1, outside: true });
    return out;
  }, [view]);

  const shift = (delta: number) =>
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });

  const isToday = (day: number) =>
    day === now.getDate() && view.month === now.getMonth() && view.year === now.getFullYear();

  return (
    <div className="panel cal-panel menu-pop absolute right-0 top-12 w-72 select-none overflow-hidden p-4" role="dialog" aria-label="Calendar">
      {/* dusty-pink decorative doodles */}
      <svg className="cal-doodle pointer-events-none absolute -right-3 -top-3 size-16" viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="40" cy="24" r="14" fill="currentColor" opacity="0.35" />
        <path d="M8 44c6-8 14-8 20-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <svg className="cal-doodle pointer-events-none absolute -bottom-2 -left-2 size-14" viewBox="0 0 56 56" fill="none" aria-hidden>
        <path d="M10 40q8-14 18-8t16-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="4" fill="currentColor" opacity="0.4" />
      </svg>

      <div className="relative flex items-center justify-between">
        <button className="icon-btn !size-8" aria-label="Previous month" onClick={() => shift(-1)}>
          <ChevronLeft className="size-4" />
        </button>
        <h2 className="cal-heading font-hand text-3xl leading-none">
          {MONTHS[view.month]} <span className="text-xl opacity-70">{view.year}</span>
        </h2>
        <button className="icon-btn !size-8" aria-label="Next month" onClick={() => shift(1)}>
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="relative mt-3 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal-weekday text-[0.68rem] font-bold uppercase tracking-wider">{w}</span>
        ))}
        {cells.map((c, i) => (
          <span
            key={i}
            className={cn(
              "cal-day mx-auto flex size-8 items-center justify-center rounded-full text-sm tabular-nums",
              c.outside && "cal-day-outside",
              !c.outside && isToday(c.day) && "cal-today",
            )}
          >
            {c.day}
          </span>
        ))}
      </div>

      <button className="cal-today-btn relative mt-3 w-full" onClick={() => setView({ year: now.getFullYear(), month: now.getMonth() })}>
        Back to today
      </button>
      <button className="sr-only" onClick={onClose} aria-label="Close calendar" />
    </div>
  );
}
