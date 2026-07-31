// ============================================================================
// ATLAS Design System — Theme Context
// ============================================================================
// Provides application-wide theme management with localStorage persistence.
// Dark theme is the default. Light theme applies the 'light' class to <html>.
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  /** The currently active theme. */
  theme: Theme;
  /** Set the theme explicitly. */
  setTheme: (theme: Theme) => void;
  /** Toggle between dark and light themes. */
  toggleTheme: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'atlas-theme';
const DEFAULT_THEME: Theme = 'dark';

// ── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (e.g. in sandboxed iframes).
  }
  return DEFAULT_THEME;
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Silently ignore write failures.
  }
}

function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  /** Override the initial theme (ignores localStorage when provided). */
  initialTheme?: Theme;
  children: ReactNode;
}

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return initialTheme ?? readStoredTheme();
  });

  // Apply theme class to <html> on mount and on every change.
  useEffect(() => {
    applyThemeToDocument(theme);
    persistTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    if (isValidTheme(next)) {
      setThemeState(next);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error(
      'useTheme() must be used within a <ThemeProvider>. ' +
        'Wrap your application root with <ThemeProvider> from the design system.',
    );
  }
  return context;
}
