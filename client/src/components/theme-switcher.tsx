import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = (stored as "light" | "dark") || systemPreference;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 px-0 hover:bg-accent/50 transition-colors"
      data-testid="theme-switcher"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 transition-transform rotate-0 scale-100" />
      ) : (
        <Sun className="h-4 w-4 transition-transform rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}