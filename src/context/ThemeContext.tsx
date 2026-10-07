import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  btnOutline: string;
  btnOutlineSm: string;
  btnActive: string;
  cardBg: string;
  cardSubtle: string;
  borderClass: string;
  textPrimary: string;
  textSecondary: string;
  inputClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default is dark as requested ("по умолчанию тёмная")
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('wifi_expert_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // fallback
    }
    return 'dark';
  });

  const isDark = theme === 'dark';

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('wifi_expert_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = '#18181b';
      document.body.style.color = '#f4f4f5';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f4f4f5';
      document.body.style.color = '#18181b';
    }
  }, [theme, isDark]);

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    btnOutline: isDark
      ? 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-sm'
      : 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-sm',
    btnOutlineSm: isDark
      ? 'inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-sm'
      : 'inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-sm',
    btnActive: isDark
      ? 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-white bg-white text-zinc-950 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap'
      : 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-900 bg-zinc-900 text-white shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap',
    cardBg: isDark
      ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl'
      : 'bg-white border border-zinc-200 text-zinc-900 shadow-sm',
    cardSubtle: isDark
      ? 'bg-zinc-950/70 border border-zinc-800/80 text-zinc-200'
      : 'bg-zinc-50 border border-zinc-200 text-zinc-800',
    borderClass: isDark ? 'border-zinc-800' : 'border-zinc-200',
    textPrimary: isDark ? 'text-zinc-100' : 'text-zinc-900',
    textSecondary: isDark ? 'text-zinc-400' : 'text-zinc-500',
    inputClass: isDark
      ? 'bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none'
      : 'bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none'
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
