import { AppSidebar } from "@/components/app-sidebar"
import { AnalyticsRadar } from "@/components/analytics/analytics-radar"
import { ChartAreaInteractive } from "@/components/analytics/analytics-area"
import { ChartPieInteractive } from "@/components/analytics/analytics-pie"
import { ChartBarMultiple } from "@/components/analytics/analytics-bar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface AnalyticsProps {
  radarData: Array<{
    category: string
    rentals: number
  }>
}

export default function Analytics({ radarData }: AnalyticsProps) {
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
              {/* Interactive Area Chart - Spans Full Width */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Responsive Grid for Radar, Pie, and Bar Charts */}
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:px-6">
                <AnalyticsRadar radarData={radarData} />
                <ChartPieInteractive />
                <ChartBarMultiple />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
