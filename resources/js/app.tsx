import { configureEcho } from '@laravel/echo-react'
import * as React from 'react'
import { createInertiaApp, router } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

configureEcho({ broadcaster: 'reverb' })

// Remove any previously registered listener before adding a new one.
// window persists across Vite HMR module reloads, unlike module-level variables.
const w = window as Window & { __flashListener?: () => void }
if (w.__flashListener) {
  w.__flashListener()
}

w.__flashListener = router.on('success', (event) => {
  const flash = event.detail.page.props.flash as { success?: string; error?: string } | undefined
  // Use fixed IDs so Sonner replaces rather than duplicates if this event
  // fires more than once (e.g. Inertia fires on both redirect + follow-up GET).
  if (flash?.success) {
    toast.success(flash.success, { id: 'flash-success' })
  }
  if (flash?.error) {
    toast.error(flash.error, { id: 'flash-error' })
  }
})

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<string, any>
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App {...props} />
          <Toaster richColors closeButton />
        </ThemeProvider>
      </TooltipProvider>
    )
  },
})
