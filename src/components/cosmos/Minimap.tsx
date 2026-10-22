import type { CanvasItem, View } from "@/lib/cosmos/types";
import { COLOR_CLASS } from "@/lib/cosmos/types";

const W = 180, H = 120;

export function Minimap({ items, view, size, onCenter, dimmed }: {
  items: CanvasItem[]; view: View; size: { w: number; h: number }; onCenter: (x: number, y: number) => void; dimmed: boolean;
}) {
  const vp = { x: -view.x / view.zoom, y: -view.y / view.zoom, w: size.w / view.zoom, h: size.h / view.zoom };
  let minX = vp.x, minY = vp.y, maxX = vp.x + vp.w, maxY = vp.y + vp.h;
  for (const i of items) {
    minX = Math.min(minX, i.x); minY = Math.min(minY, i.y);
    maxX = Math.max(maxX, i.x + i.w); maxY = Math.max(maxY, i.y + i.h);
  }
  const pad = 80;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const s = Math.min(W / (maxX - minX), H / (maxY - minY));
  const ox = (W - (maxX - minX) * s) / 2, oy = (H - (maxY - minY) * s) / 2;
  const tx = (x: number) => ox + (x - minX) * s;
  const ty = (y: number) => oy + (y - minY) * s;

  const onClick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onCenter((e.clientX - r.left - ox) / s + minX, (e.clientY - r.top - oy) / s + minY);
  };

  return (
    <div
      className={`panel chrome absolute bottom-4 right-4 z-[100000] hidden overflow-hidden md:block${dimmed ? " chrome-dim" : ""}`}
      style={{ width: W, height: H }}
      onPointerDown={onClick}
      aria-label="Minimap"
      role="img"
    >
      {items.map((i) => (
        <div key={i.id} className={`absolute rounded-[2px] ${i.type === "calendar" ? "bg-cal" : COLOR_CLASS[i.color]}`}
          style={{ left: tx(i.x), top: ty(i.y), width: Math.max(2, i.w * s), height: Math.max(2, i.h * s) }} />
      ))}
      <div className="minimap-viewport absolute" style={{ left: tx(vp.x), top: ty(vp.y), width: vp.w * s, height: vp.h * s }} />
    </div>
  );
}
