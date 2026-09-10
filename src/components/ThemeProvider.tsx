"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Baca dari localStorage saat awal mount
    const savedTheme = (localStorage.getItem("pos_theme") as Theme) || "system";
    setThemeState(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (selectedTheme: Theme) => {
      let active: "light" | "dark" = "light";

      if (selectedTheme === "system") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        active = systemDark ? "dark" : "light";
      } else {
        active = selectedTheme;
      }

      setResolvedTheme(active);

      if (active === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);

    // Listener jika mode sistem berubah saat pengguna memilih "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("pos_theme", newTheme);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
