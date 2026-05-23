import * as React from 'react'
import { createInertiaApp, router } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

// Global listener for Inertia flash messages (triggers on every page navigation)
router.on('success', (event) => {
  const flash = event.detail.page.props.flash as { success?: string; error?: string } | undefined
  if (flash?.success) {
    toast.success(flash.success)
  }
  if (flash?.error) {
    toast.error(flash.error)
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
