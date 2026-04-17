"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

export function DarkModeToggle() {
  const [theme, setTheme] = useState<'dark'|'light'|'system'>('system');

  useEffect(() => {
    const saved = localStorage.getItem('site:theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') setTheme(saved);
    applyTheme((saved as any) || 'system');
  }, []);

  const applyTheme = (value: 'dark'|'light'|'system') => {
    const html = document.documentElement;
    if (value === 'system') {
      html.removeAttribute('data-theme');
      html.classList.remove('dark');
    } else if (value === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark');
    } else {
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark');
    }
  };

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
    localStorage.setItem('site:theme', next);
    applyTheme(next);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme" className="rounded-full w-10 h-10">
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

export default DarkModeToggle;
