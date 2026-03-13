"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"

const THEME_KEY = "eden-theme"

export type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === "light" || stored === "dark" || stored === "system") return stored
  return "system"
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement
  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system"
  return getStoredTheme()
}

function getInitialResolved(): "light" | "dark" {
  if (typeof window === "undefined") return "dark"
  const t = getStoredTheme()
  return t === "system" ? getSystemTheme() : t
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(getInitialResolved)

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    const resolved = next === "system" ? getSystemTheme() : next
    setResolvedTheme(resolved)
    applyTheme(resolved)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next)
    }
  }, [])

  // Hydrate from localStorage and apply
  useEffect(() => {
    const stored = getStoredTheme()
    setThemeState(stored)
    const resolved = stored === "system" ? getSystemTheme() : stored
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Listen for system preference changes when theme is "system"
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme !== "system") return
      const resolved = media.matches ? "dark" : "light"
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [theme])

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
