import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export type Theme = "light" | "dark";

interface ThemeToggleProps {
  variant?: "icon" | "full" | "badge";
  className?: string;
  showLabel?: boolean;
  onThemeChange?: (theme: Theme) => void;
}

export default function ThemeToggle({
  variant = "icon",
  className = "",
  showLabel = false,
  onThemeChange,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Check saved localStorage (using v2 key to ensure light theme default for all initial loads)
    const saved = localStorage.getItem("uttarkashi_geo_theme_v2");
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    // 2. Default strictly to light theme on first load
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("uttarkashi_geo_theme_v2", theme);

    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [theme, onThemeChange]);

  // Listen for theme change events from other ThemeToggle instances
  useEffect(() => {
    const handleGlobalThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail && (customEvent.detail === "light" || customEvent.detail === "dark")) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("themeChange", handleGlobalThemeChange);
    return () => {
      window.removeEventListener("themeChange", handleGlobalThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("uttarkashi_geo_theme_v2", nextTheme);
    window.dispatchEvent(new CustomEvent("themeChange", { detail: nextTheme }));
  };

  const isDark = theme === "dark";

  if (variant === "full") {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border ${
          isDark
            ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        type="button"
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
          <span>{isDark ? "Light Theme" : "Dark Theme"}</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  if (variant === "badge") {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer border shadow-xs ${
          isDark
            ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700/80"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300/80"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        type="button"
      >
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        )}
        {showLabel && <span>{isDark ? "Light" : "Dark"}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 cursor-pointer border shadow-sm flex items-center justify-center ${
        isDark
          ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-slate-600"
          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:border-slate-400"
      } ${className}`}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
      type="button"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

