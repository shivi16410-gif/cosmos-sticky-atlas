import { useEffect, useRef, useState } from "react";
import type { CanvasItem, Point } from "@/lib/cosmos/types";
import type { CosmosStore } from "@/lib/cosmos/useCosmosStore";
import { trackDrag } from "@/lib/cosmos/drag";
import { NoteItem } from "./NoteItem";
import { CalendarItem } from "./CalendarItem";
import { TextItem } from "./TextItem";
import { cn } from "@/lib/utils";

export const MIN_ZOOM = 0.2, MAX_ZOOM = 3, ZOOM_STEP = 1.35, WHEEL_ZOOM_INTENSITY = 0.004;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export type CanvasTool = "text" | "draw" | "erase" | "connector" | null;
interface Props { store: CosmosStore; selected: string | null; setSelected: (id: string | null) => void; containerRef: React.RefObject<HTMLDivElement | null>; tool: CanvasTool; editing: string | null; setEditing: (id: string | null) => void; drawColor: string; drawWidth: number; }
const path = (points: Point[]) => points.length ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}` : "";
const center = (i: CanvasItem) => ({ x: i.x + i.w / 2, y: i.y + i.h / 2 });

function Lines({ items, draft, color, width }: { items: CanvasItem[]; draft: Point[]; color: string; width: number }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  return <svg className="pointer-events-none absolute overflow-visible" style={{ inset: 0, width: 1, height: 1 }} aria-hidden><defs><marker id="cosmos-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="context-stroke" /></marker></defs>
    {items.filter((i) => i.type === "drawing").map((i) => <path key={i.id} d={path(i.points ?? [])} fill="none" stroke={i.stroke ?? "#7c3aed"} strokeWidth={i.strokeWidth ?? 3} strokeLinecap="round" strokeLinejoin="round" />)}
    {items.filter((i) => i.type === "connector").map((i) => { const from = i.fromId ? byId.get(i.fromId) : undefined, to = i.toId ? byId.get(i.toId) : undefined; if (!from || !to) return null; const a = center(from), b = center(to); return <path key={i.id} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} fill="none" stroke={i.stroke ?? "#7c3aed"} strokeWidth={i.strokeWidth ?? 2} markerEnd="url(#cosmos-arrow)" />; })}
    {draft.length > 1 && <path d={path(draft)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />}
  </svg>;
}
const segDistance = (p: Point, a: Point, b: Point) => { const dx = b.x - a.x, dy = b.y - a.y, len = dx * dx + dy * dy, t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len)) : 0; return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };

export function Canvas({ store, selected, setSelected, containerRef, tool, editing, setEditing, drawColor, drawWidth }: Props) {
  const { view, setView, items, settings } = store, viewRef = useRef(view); viewRef.current = view;
  const [draft, setDraft] = useState<Point[]>([]);
  const draftRef = useRef<Point[]>([]), drawFrame = useRef<number | null>(null);
  const pointAt = (e: { clientX: number; clientY: number }, canvas: HTMLElement): Point => { const r = canvas.getBoundingClientRect(), v = viewRef.current; return { x: (e.clientX - r.left - v.x) / v.zoom, y: (e.clientY - r.top - v.y) / v.zoom }; };
  useEffect(() => { const el = containerRef.current; if (!el) return; const wheel = (e: WheelEvent) => { if ((e.target as HTMLElement).closest("textarea,.overflow-auto") && !e.ctrlKey) return; e.preventDefault(); const v = viewRef.current, next = clamp(v.zoom * Math.exp(-e.deltaY * WHEEL_ZOOM_INTENSITY), MIN_ZOOM, MAX_ZOOM), r = el.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, k = next / v.zoom; setView({ zoom: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k }); }; el.addEventListener("wheel", wheel, { passive: false }); return () => el.removeEventListener("wheel", wheel); }, [containerRef, setView]);
  const startDrawing = (e: React.PointerEvent<HTMLDivElement>) => { const canvas = e.currentTarget, first = pointAt(e, canvas); draftRef.current = [first]; setDraft([first]); const move = (ev: PointerEvent) => { draftRef.current.push(pointAt(ev, canvas)); if (drawFrame.current === null) drawFrame.current = requestAnimationFrame(() => { drawFrame.current = null; setDraft([...draftRef.current]); }); }; const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); if (drawFrame.current !== null) { cancelAnimationFrame(drawFrame.current); drawFrame.current = null; } store.addDrawing(draftRef.current, drawColor, drawWidth); draftRef.current = []; setDraft([]); }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); };
  const onCapture = (e: React.PointerEvent<HTMLDivElement>) => { if (e.button !== 0 || !tool) return; const target = (e.target as HTMLElement).closest<HTMLElement>("[data-item]"); if (tool === "connector" && target) { e.preventDefault(); e.stopPropagation(); const id = target.dataset["item"]!, from = selected; if (from && from !== id) { store.addConnector(from, id); setSelected(null); } else setSelected(id); return; } if (tool === "draw") { e.preventDefault(); e.stopPropagation(); startDrawing(e); return; } if (tool === "erase") { e.preventDefault(); e.stopPropagation(); const p = pointAt(e, e.currentTarget), hit = [...items].reverse().find((i) => i.type === "drawing" && (i.points ?? []).some((q, n, all) => n > 0 && !!all[n - 1] && segDistance(p, all[n - 1]!, q) < (i.strokeWidth ?? 3) + 8)); if (hit) store.remove(hit.id); } };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => { if (e.button !== 0 && e.button !== 1) return; setSelected(null); e.preventDefault(); if (tool === "text" && e.button === 0) { const p = pointAt(e, e.currentTarget), id = store.add("text", p.x, p.y); setSelected(id); setEditing(id); return; } const x = view.x, y = view.y; trackDrag(e, (dx, dy) => setView((v) => ({ ...v, x: x + dx, y: y + dy }))); };
  const grid = 24 * view.zoom;
  return <div ref={containerRef} onPointerDownCapture={onCapture} onPointerDown={onDown} onDoubleClick={(e) => { if (e.target === e.currentTarget && !tool) { const p = pointAt(e, e.currentTarget); setSelected(store.add("note", p.x, p.y)); } }} className={cn("canvas-surface absolute inset-0 overflow-hidden", settings.showGrid && "canvas-grid", tool === "text" && "cursor-text", tool === "draw" && "cursor-crosshair", tool === "erase" && "cursor-cell")} style={{ backgroundSize: `${grid}px ${grid}px`, backgroundPosition: `${view.x}px ${view.y}px` }}><div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}><Lines items={items} draft={draft} color={drawColor} width={drawWidth} /><div className="pointer-events-auto">{items.map((item) => item.type === "text" ? <TextItem key={item.id} item={item} zoom={view.zoom} selected={selected === item.id} editing={editing === item.id} onSelect={setSelected} setEditing={setEditing} store={store} /> : item.type === "calendar" ? <CalendarItem key={item.id} item={item} zoom={view.zoom} selected={selected === item.id} onSelect={setSelected} store={store} /> : item.type === "drawing" || item.type === "connector" ? null : <NoteItem key={item.id} item={item} zoom={view.zoom} selected={selected === item.id} onSelect={setSelected} store={store} />)}</div></div></div>;
}
