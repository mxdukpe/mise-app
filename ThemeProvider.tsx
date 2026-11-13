import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, Palette, spacing, shape, size, springs, type, elevation, fonts } from './theme';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colors: Palette;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  spacing: typeof spacing;
  shape: typeof shape;
  size: typeof size;
  springs: typeof springs;
  type: typeof type;
  elevation: typeof elevation;
  fonts: typeof fonts;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Le mode suit le système ; `setMode` sert aux outils de démo pour forcer clair ou sombre.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? palettes.dark : palettes.light,
      isDark,
      mode,
      setMode,
      spacing,
      shape,
      size,
      springs,
      type,
      elevation,
      fonts,
    }),
    [isDark, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé à l’intérieur de <ThemeProvider>.');
  return ctx;
}
