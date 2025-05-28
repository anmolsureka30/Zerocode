import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from local storage or use system
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    return savedTheme || "system";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(systemPreference.matches);
      
      // Update when system preference changes
      const updateTheme = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      systemPreference.addEventListener("change", updateTheme);
      return () => systemPreference.removeEventListener("change", updateTheme);
    } else {
      setIsDarkMode(theme === "dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    if (theme === "system") {
      setThemePreference(isDarkMode ? "light" : "dark");
    } else {
      setThemePreference(theme === "dark" ? "light" : "dark");
    }
  };

  return { theme, isDarkMode, setTheme: setThemePreference, toggleTheme };
}
