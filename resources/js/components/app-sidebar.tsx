import * as React from "react"
import { usePage } from "@inertiajs/react"

import { NavProducts } from "@/components/nav-products"
import { NavMain } from "@/components/nav-main"
import { NavRentals } from "@/components/nav-rentals"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ChartBarIcon,
  UsersIcon,
  PackageIcon,
  ReceiptIcon,
  UsersRoundIcon,
  ClipboardListIcon,
  HistoryIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (<LayoutDashboardIcon />),
    },
    {
      title: "Analytics",
      url: "#",
      icon: (<ChartBarIcon />),
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: (<UsersIcon />),
    },
    {
      title: "Customers",
      url: "/customers",
      icon: (<UsersRoundIcon />),
    },
  ],
  rentals: [
    {
      title: "Kasir",
      url: "/rentals",
      icon: (<ClipboardListIcon className="size-4" />),
    },
    {
      title: "Riwayat Transaksi",
      url: "/rentals/history",
      icon: (<HistoryIcon className="size-4" />),
    },
  ],
  documents: [
    {
      name: "Manage Product",
      url: "/products",
      icon: (<PackageIcon />),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth } = usePage<{ auth?: { user?: { name: string; email: string; avatar?: string | null } } }>().props

  const user = {
    name: auth?.user?.name || "Cashier",
    email: auth?.user?.email || "cashier@kodya.id",
    avatar: auth?.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(auth?.user?.name || "Cashier")}&backgroundColor=0a0a0a,1a1a1a&textColor=ffffff`,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <div className="flex size-6 items-center justify-center rounded bg-neutral-900 overflow-hidden">
                  <img
                    src="/Logo2.png"
                    alt="Logo"
                    className="size-5 object-contain"
                  />
                </div>
                <span className="text-base font-semibold">SummitRent</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavRentals
          icon={<ReceiptIcon className="size-4" />}
          items={data.rentals}
        />
        <NavProducts items={data.documents} label="Product" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
