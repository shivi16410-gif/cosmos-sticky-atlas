import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasItem, ItemType, Settings, View } from "./types";
import { TYPE_DEFAULTS, uid } from "./types";

// Storage adapter: swap this for cloud sync later without touching components.
const KEY = "cosmos:board:v1";
const HISTORY_LIMIT = 100;

interface Persisted {
  items: CanvasItem[];
  view: View;
  settings: Settings;
}

function seed(): CanvasItem[] {
  return [
    { id: uid(), type: "note", x: 120, y: 120, w: 240, h: 200, z: 1, color: "yellow", font: "hand", text: "Welcome to COSMOS ✦\n\nDrag me around, resize from the corner, double‑click the canvas to add a note." },
    { id: uid(), type: "idea", x: 420, y: 90, w: 220, h: 170, z: 2, color: "lavender", font: "sans", text: "Scroll to zoom. Drag empty space to pan." },
    { id: uid(), type: "goal", x: 700, y: 160, w: 240, h: 160, z: 3, color: "mint", font: "marker", text: "Run a half marathon by spring" },
    { id: uid(), type: "checklist", x: 420, y: 320, w: 260, h: 240, z: 4, color: "blue", font: "sans", text: "This week", checklist: [
      { id: uid(), text: "Sketch the plan", done: true },
      { id: uid(), text: "Call mom", done: false },
      { id: uid(), text: "Book dentist", done: false },
    ] },
  ];
}

export type SaveStatus = "saved" | "saving";

export function useCosmosStore() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const [settings, setSettings] = useState<Settings>({ showGrid: true, showMinimap: true });
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [, force] = useState(0);
  const past = useRef<CanvasItem[][]>([]);
  const future = useRef<CanvasItem[][]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        setItems(p.items ?? []);
        if (p.view) setView(p.view);
        if (p.settings) setSettings(p.settings);
      } else setItems(seed());
    } catch {
      setItems(seed());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setStatus("saving");
    const t = setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify({ items, view, settings } satisfies Persisted));
      setStatus("saved");
    }, 450);
    return () => clearTimeout(t);
  }, [items, view, settings, loaded]);

  /** Save the current state to history; call once at the start of any user action. */
  const checkpoint = useCallback(() => {
    past.current.push(itemsRef.current);
    if (past.current.length > HISTORY_LIMIT) past.current.shift();
    future.current = [];
    force((n) => n + 1);
  }, []);

  const mutate = useCallback(
    (fn: (prev: CanvasItem[]) => CanvasItem[], record = true) => {
      if (record) checkpoint();
      setItems(fn);
    },
    [checkpoint],
  );

  const update = useCallback(
    (id: string, patch: Partial<CanvasItem>, record = false) =>
      mutate((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)), record),
    [mutate],
  );

  const add = useCallback(
    (type: ItemType, cx: number, cy: number) => {
      const d = TYPE_DEFAULTS[type];
      const z = Math.max(0, ...itemsRef.current.map((i) => i.z)) + 1;
      const item: CanvasItem = {
        id: uid(), type, w: d.w, h: d.h, x: cx - d.w / 2, y: cy - d.h / 2, z,
        color: d.color, font: "sans", text: d.text,
        checklist: type === "checklist" ? [{ id: uid(), text: "", done: false }] : undefined,
      };
      mutate((prev) => [...prev, item]);
      return item.id;
    },
    [mutate],
  );

  const remove = useCallback((id: string) => mutate((prev) => prev.filter((i) => i.id !== id)), [mutate]);

  const duplicate = useCallback(
    (id: string) => {
      const src = itemsRef.current.find((i) => i.id === id);
      if (!src) return;
      const z = Math.max(...itemsRef.current.map((i) => i.z)) + 1;
      const copy = { ...src, id: uid(), x: src.x + 30, y: src.y + 30, z, checklist: src.checklist?.map((c) => ({ ...c, id: uid() })) };
      mutate((prev) => [...prev, copy]);
      return copy.id;
    },
    [mutate],
  );

  const bringToFront = useCallback((id: string) => {
    const max = Math.max(...itemsRef.current.map((i) => i.z));
    const it = itemsRef.current.find((i) => i.id === id);
    if (it && it.z < max) setItems((prev) => prev.map((i) => (i.id === id ? { ...i, z: max + 1 } : i)));
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(itemsRef.current);
    setItems(prev);
    force((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(itemsRef.current);
    setItems(next);
    force((n) => n + 1);
  }, []);

  const clear = useCallback(() => mutate(() => []), [mutate]);

  return {
    items, view, setView, settings, setSettings, loaded, status,
    add, update, remove, duplicate, bringToFront, checkpoint, mutate, clear,
    undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0,
  };
}

export type CosmosStore = ReturnType<typeof useCosmosStore>;
