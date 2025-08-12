

import * as React from "react";
import "@theme-toggles/react/css/Around.css";
import { Around } from "@theme-toggles/react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState(() => {
    // Check localStorage first, then system preference, then default to light
    const saved = localStorage.getItem("lynkr-theme");
    if (saved) return saved;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }

    return "light";
  });

  React.useEffect(() => {
    // Apply theme to both html and body elements
    const root = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("lynkr-theme", theme);
  }, [theme]);

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("lynkr-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Around
      duration={400}
      toggled={theme === "dark"}
      toggle={handleToggle}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
    />
  );
}