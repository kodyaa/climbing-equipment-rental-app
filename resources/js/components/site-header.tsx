import { Button } from "@/components/ui/button"
import { usePage } from "@inertiajs/react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { AgentChatDialog } from "@/components/agents/agent-chat-dialog"

export function SiteHeader() {
  const { url } = usePage()
  const path = url.split("?")[0]
  const segment = path.split("/").filter(Boolean)[0] || ""
  const pageTitle = segment
    ? segment.charAt(0).toUpperCase() + segment.slice(1)
    : "Dashboard"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <AgentChatDialog />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}


