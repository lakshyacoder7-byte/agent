"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    let storedTheme = "dark";
    try {
      const saved = window.localStorage.getItem("aven-ui-theme");
      if (saved === "light" || saved === "dark" || saved === "system") storedTheme = saved;
    } catch {
      // Keep the accessible light default when storage is unavailable.
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (preference) => {
      const resolved = preference === "system" ? (media.matches ? "dark" : "light") : preference;
      setThemeState(preference);
      document.documentElement.dataset.theme = resolved;
    };

    applyTheme(storedTheme);
    const handleChange = () => {
      try {
        const saved = window.localStorage.getItem("aven-ui-theme") || "dark";
        if (saved === "system") applyTheme("system");
      } catch {
        // Storage is optional.
      }
    };
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  const setTheme = useCallback((preference) => {
    if (preference !== "light" && preference !== "dark" && preference !== "system") return;
    const resolved = preference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    setThemeState(preference);
    document.documentElement.dataset.theme = resolved;
    try {
      window.localStorage.setItem("aven-ui-theme", preference);
    } catch {
      // The current page still reflects the chosen theme.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
