import { createContext, useContext, useEffect, useState } from "react"
import { flushSync } from "react-dom"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme, event?: React.MouseEvent | MouseEvent) => {
      const root = window.document.documentElement

      const updateTheme = () => {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      }

      // Check if browser supports View Transitions and respect prefers-reduced-motion
      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        // Fallback: apply class-based transitions temporarily
        root.classList.add("theme-transition")
        updateTheme()
        setTimeout(() => {
          root.classList.remove("theme-transition")
        }, 300)
        return
      }

      // Calculate center of circular reveal from click coordinates
      const x = event ? event.clientX : window.innerWidth / 2
      const y = event ? event.clientY : window.innerHeight / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      // Start view transition with flushSync to update DOM state immediately
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          updateTheme()
        })
      })

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 450,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
