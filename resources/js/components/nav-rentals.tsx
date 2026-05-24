import * as React from "react"
import { Link, usePage } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { ChevronRightIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavRentals({
  label = "Rentals",
  icon,
  items,
}: {
  label?: string
  icon?: React.ReactNode
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const { url } = usePage()

  // Auto-expand when any sub-item is active
  const isAnyActive = items.some(
    (item) => url === item.url || url.startsWith(item.url.split("?")[0])
  )

  const [open, setOpen] = React.useState(isAnyActive)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setOpen((prev) => !prev)}
            className="w-full justify-between cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              {icon}
              <span className="font-medium">Manage Rentals</span>
            </span>
            <ChevronRightIcon
              className={cn(
                "size-4 transition-transform duration-200 text-muted-foreground",
                open && "rotate-90"
              )}
            />
          </SidebarMenuButton>

          {open && (
            <SidebarMenuSub>
              {items.map((item) => {
                const basePath = item.url.split("?")[0]
                const isActive = url === item.url || url === basePath
                return (
                  <SidebarMenuSubItem key={item.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-all duration-200",
                        isActive
                          ? "data-active:bg-neutral-900 data-active:text-white data-active:dark:bg-white data-active:dark:text-neutral-950 font-semibold shadow-xs [&>svg]:text-current"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
