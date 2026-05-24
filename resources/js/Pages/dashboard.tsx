import { AppSidebar } from "@/components/app-sidebar"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface PageProps {
  stats: {
    total_revenue: any
    total_customers: any
    active_rentals: any
    items_rented: any
  }
  chartData: any[]
}

export default function Page({ stats, chartData }: PageProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashboardCards stats={stats} />
              <div className="px-4 lg:px-6">
                <DashboardChart chartData={chartData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


