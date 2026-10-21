import { useEffect, useState } from "react";

const KEY = "cosmos:theme";
export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    if (localStorage.getItem(KEY) === "dark") setTheme("dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const toggle = () =>
    setTheme((t) => {
      const n = t === "light" ? "dark" : "light";
      localStorage.setItem(KEY, n);
      return n;
    });
  return { theme, toggle };
}
