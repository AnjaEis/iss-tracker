"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "./theme";

function readStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  // Erst nach dem Mounten bekannt; das Inline-Skript in layout.js hat den Modus bereits gesetzt.
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");

    // Systemeinstellung nur übernehmen, solange keine eigene Wahl gespeichert ist.
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = (event) => {
      if (readStoredTheme()) return;
      const next = event.matches ? "light" : "dark";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  function toggle() {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ohne Browser-Speicher gilt die Wahl nur bis zum Neuladen.
    }
  }

  const label =
    theme === null
      ? "Farbschema wechseln"
      : theme === "light"
        ? "Zum dunklen Modus wechseln"
        : "Zum hellen Modus wechseln";

  // Welches Symbol sichtbar ist, steuert CSS über [data-theme] – so gibt es keinen Hydration-Unterschied.
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <svg className="icon-sun" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="icon-moon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
