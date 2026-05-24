import * as React from "react"
import { Link, usePage } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const { url } = usePage()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // Check if the current URL matches the item URL
            const isActive = url === item.url || url.startsWith(item.url + "/")

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-200",
                    isActive
                      ? "data-active:bg-neutral-900 data-active:text-white data-active:dark:bg-white data-active:dark:text-neutral-950 font-semibold shadow-xs"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
