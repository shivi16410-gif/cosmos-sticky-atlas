import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers,
  Menu,
  MoveUpRight,
  PenLine,
  Plus,
  X,
} from "lucide-react";
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
      {
        name: "description",
        content: "Organize ideas, goals, checklists and plans on an infinite whiteboard canvas.",
      },
      { property: "og:title", content: "COSMOS — Infinite canvas for your thoughts" },
      {
        property: "og:description",
        content: "Organize ideas, goals, checklists and plans on an infinite whiteboard canvas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const stageStyle = (_name: string) => undefined;

function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span className={`cosmos-wordmark ${small ? "cosmos-wordmark-small" : ""}`} aria-label="COSMOS">
      <i />
      COSMOS
    </span>
  );
}

function MiniCanvas() {
  return (
    <div
      className="mini-canvas build-item"
      style={stageStyle("canvas")}
      aria-label="A COSMOS canvas filled with connected notes"
    >
      <div className="canvas-gridlines" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <svg
        className="canvas-lines"
        viewBox="0 0 900 530"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M145 174 C270 198 318 192 402 157 S571 106 670 180"
          stroke="#d25e46"
          strokeWidth="2"
          strokeDasharray="5 8"
        />
        <path
          d="M241 364 C370 364 422 327 512 304 S690 312 766 238"
          stroke="#3d6b65"
          strokeWidth="2"
        />
      </svg>
      <article className="canvas-card coral card-idea build-item" style={stageStyle("idea")}>
        <span className="card-pin" />
        <small>BIG IDEA</small>
        <strong>
          Make more room for
          <br />
          what matters.
        </strong>
        <div className="scribble">↗</div>
      </article>
      <article className="canvas-card yellow card-plan build-item" style={stageStyle("plan")}>
        <small>THIS WEEK</small>
        <strong>
          Ship a little
          <br />
          something lovely
        </strong>
        <div className="check-line">
          <Check size={14} /> first draft
        </div>
        <div className="check-line">
          <Check size={14} /> share it
        </div>
      </article>
      <article className="canvas-card mint card-people build-item" style={stageStyle("people")}>
        <div className="avatars">
          <b>R</b>
          <b>M</b>
          <b>J</b>
        </div>
        <strong>
          Thursday
          <br />
          studio session
        </strong>
        <span>10:30 — 11:15</span>
      </article>
      <article className="canvas-card ink card-note build-item" style={stageStyle("note")}>
        <PenLine size={17} />
        <strong>
          A thought becomes
          <br />a constellation.
        </strong>
        <span>keep connecting</span>
      </article>
      <div className="shape shape-star build-item" style={stageStyle("star")}>
        ✦
      </div>
      <div className="shape shape-ring build-item" style={stageStyle("ring")} />
      <div className="shape shape-dot build-item" style={stageStyle("dot")} />
      <div className="canvas-toolbar build-item" style={stageStyle("toolbar")}>
        <Plus size={17} />
        <span />
        <MoveUpRight size={17} />
        <PenLine size={17} />
        <Layers size={17} />
      </div>
    </div>
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="brand-link">
          <Wordmark small build="logo" />
        </Link>
        <nav
          className={menuOpen ? "nav-links nav-links-open" : "nav-links"}
          aria-label="Main navigation"
        >
          <a
            href="#product"
            className="build-item"
            style={stageStyle("product")}
            onClick={() => setMenuOpen(false)}
          >
            Product
          </a>
          <a
            href="#features"
            className="build-item"
            style={stageStyle("features")}
            onClick={() => setMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#about"
            className="build-item"
            style={stageStyle("about")}
            onClick={() => setMenuOpen(false)}
          >
            About
          </a>
          <Link to="/canvas" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>
            Open canvas <ArrowRight size={15} />
          </Link>
        </nav>
        <div className="nav-actions">
          <Link to="/canvas" className="sign-in build-item" style={stageStyle("sign-in")}>
            Sign in
          </Link>
          <Link
            to="/canvas"
            className="button button-dark build-item"
            style={stageStyle("nav-cta")}
          >
            Get started <ArrowUpRight size={16} />
          </Link>
        </div>
        <button
          className="menu-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="product">
        <div className="hero-copy">
          <p className="eyebrow build-item" style={stageStyle("eyebrow")}>
            <span />
            THE SPACE BETWEEN IDEAS
          </p>
          <h1>
            <span className="build-item" style={stageStyle("headline-one")}>
              Your work,
            </span>
            <br />
            <em className="build-item" style={stageStyle("headline-two")}>
              in orbit.
            </em>
          </h1>
          <p className="hero-description build-item" style={stageStyle("description")}>
            COSMOS is the infinite creative workspace for thinking out loud, making connections, and
            bringing your best work into focus.
          </p>
          <div className="hero-actions">
            <Link
              to="/canvas"
              className="button button-coral build-item"
              style={stageStyle("hero-cta")}
            >
              Start exploring <ArrowRight size={18} />
            </Link>
            <a className="text-link build-item" style={stageStyle("hero-link")} href="#features">
              See how it works <span>↓</span>
            </a>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun-disc build-item" style={stageStyle("sun")} />
          <MiniCanvas />
          <div className="art-caption build-item" style={stageStyle("caption")}>
            <span>∞</span> built for nonlinear thinking
          </div>
        </div>
      </section>

      <section
        className="marquee build-item"
        style={stageStyle("marquee")}
        aria-label="Capabilities"
      >
        <div>
          THINK FREELY <i /> CONNECT DEEPLY <i /> MAKE THINGS REAL <i /> THINK FREELY <i /> CONNECT
          DEEPLY
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">
            <span />
            YOUR WHOLE PROCESS
          </p>
          <h2>
            Everything finds
            <br />
            its <em>place.</em>
          </h2>
          <p>
            From a tiny spark to a complete plan, COSMOS gives every kind of thought a place to
            land—and room to grow.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-large">
            <div className="feature-visual notes-visual">
              <div className="little-note">
                The best ideas
                <br />
                start messy.
              </div>
              <div className="pink-note">
                Add a little
                <br />
                wonder
              </div>
              <svg viewBox="0 0 300 170">
                <path
                  d="M42 130 C106 62 137 148 244 46"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />
              </svg>
            </div>
            <h3>
              Notes that live
              <br />
              where you think
            </h3>
            <p>Drop sticky notes anywhere. Gather them, pull them apart, make them yours.</p>
            <span className="feature-number">01</span>
          </article>
          <article className="feature-card">
            <div className="feature-visual list-visual">
              <span>PROJECT NORTH STAR</span>
              <p>
                <i /> Research
              </p>
              <p>
                <i /> Sketch
              </p>
              <p>
                <i className="done" /> Make it real
              </p>
            </div>
            <h3>
              Lists with a little
              <br />
              more life
            </h3>
            <p>Turn loose ideas into momentum.</p>
            <span className="feature-number">02</span>
          </article>
          <article className="feature-card">
            <div className="feature-visual draw-visual">
              <svg viewBox="0 0 300 170">
                <path
                  d="M39 108c23-72 47 36 75-32s35 80 75-29c17-45 34 20 72-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="232" cy="39" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3>A line to follow</h3>
            <p>Draw, connect, and discover the shape of a thought.</p>
            <span className="feature-number">03</span>
          </article>
        </div>
      </section>

      <section className="how-section" id="about">
        <div className="how-sticky">
          <p className="eyebrow">
            <span />A NEW WAY TO WORK
          </p>
          <h2>
            Less
            <br />
            <em>linear.</em>
            <br />
            More you.
          </h2>
        </div>
        <div className="how-steps">
          <article>
            <b>01</b>
            <h3>Begin anywhere</h3>
            <p>
              There is no blank-page anxiety here. Add a note, draw a line, pin an image—your first
              move is enough.
            </p>
          </article>
          <article>
            <b>02</b>
            <h3>Follow the threads</h3>
            <p>
              Move with your mind. Cluster ideas, make connections, and see patterns take shape in
              the open.
            </p>
          </article>
          <article>
            <b>03</b>
            <h3>Make it happen</h3>
            <p>Turn the constellation into a plan. Your ideas already know where they’re going.</p>
          </article>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-radiance" />
        <p className="eyebrow">
          <span />
          YOUR NEXT GREAT IDEA
        </p>
        <h2>
          Give it some
          <br />
          <em>space.</em>
        </h2>
        <p>Open a canvas and see where it takes you.</p>
        <Link to="/canvas" className="button button-light">
          Create your COSMOS <ArrowUpRight size={18} />
        </Link>
      </section>
      <footer className="landing-footer">
        <Wordmark small />
        <span>© 2026 COSMOS. Made for wandering minds.</span>
        <div>
          <a href="#product">Product</a>
          <a href="#features">Features</a>
          <Link to="/canvas">Open canvas</Link>
        </div>
      </footer>
    </main>
  );
}

export function CosmosApp() {
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
      const next = clamp(v.zoom * f, MIN_ZOOM, MAX_ZOOM),
        k = next / v.zoom;
      const px = size.w / 2,
        py = size.h / 2;
      return { zoom: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });

  const fit = useCallback(() => {
    if (!items.length) return setView({ x: 0, y: 0, zoom: 1 });
    const minX = Math.min(...items.map((i) => i.x)),
      minY = Math.min(...items.map((i) => i.y));
    const maxX = Math.max(...items.map((i) => i.x + i.w)),
      maxY = Math.max(...items.map((i) => i.y + i.h));
    const pad = 120;
    const zoom = clamp(
      Math.min(size.w / (maxX - minX + pad * 2), (size.h - 120) / (maxY - minY + pad * 2)),
      MIN_ZOOM,
      1.5,
    );
    setView({
      zoom,
      x: size.w / 2 - ((minX + maxX) / 2) * zoom,
      y: size.h / 2 - ((minY + maxY) / 2) * zoom,
    });
  }, [items, size, setView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT";
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      } else if (mod && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault();
        store.redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selected && !typing) {
        e.preventDefault();
        store.remove(selected);
        setSelected(null);
      } else if (e.key === "Escape") {
        if (editing) {
          setEditing(null);
          (document.activeElement as HTMLElement | null)?.blur?.();
          return;
        }
        if (tool) {
          setTool(null);
          return;
        }
        setSelected(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, selected, editing, tool]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <Canvas
        store={store}
        selected={selected}
        setSelected={setSelected}
        containerRef={containerRef}
        tool={tool}
        editing={editing}
        setEditing={setEditing}
        drawColor={drawColor}
        drawWidth={drawWidth}
      />
      <TopBar
        store={store}
        theme={theme}
        onToggleTheme={toggle}
        dimmed={dimmed}
        focusMode={focusMode}
        onToggleFocusMode={toggleFocusMode}
      />
      {!focusMode && (
        <>
          <Toolbar
            onCreate={create}
            dimmed={dimmed}
            tool={tool}
            onTool={setTool}
            drawColor={drawColor}
            setDrawColor={setDrawColor}
            drawWidth={drawWidth}
            setDrawWidth={setDrawWidth}
          />
          <ZoomControls zoom={view.zoom} onZoom={zoomBy} onFit={fit} dimmed={dimmed} />
          {store.settings.showMinimap && (
            <Minimap
              items={items}
              view={view}
              size={size}
              dimmed={dimmed}
              onCenter={(x, y) =>
                setView((v) => ({ ...v, x: size.w / 2 - x * v.zoom, y: size.h / 2 - y * v.zoom }))
              }
            />
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
