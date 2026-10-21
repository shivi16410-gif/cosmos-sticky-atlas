import { useEffect, useRef, useState } from "react";

const IDLE_MS = 2600;

/**
 * Tracks whether the floating chrome (top bar, toolbar, zoom, minimap)
 * should be dimmed because the user is working on the canvas, plus a
 * manual focus mode that hides the chrome entirely.
 */
export function useChromeVisibility() {
  const [idle, setIdle] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wake = () => {
      setIdle(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setIdle(true), IDLE_MS);
    };
    wake();
    window.addEventListener("pointermove", wake, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  return { dimmed: idle && !focusMode, focusMode, toggleFocusMode: () => setFocusMode((f) => !f) };
}
