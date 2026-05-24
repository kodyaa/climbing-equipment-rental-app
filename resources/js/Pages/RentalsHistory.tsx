import * as React from "react"
import { Head, router, Deferred } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RentalHistoryTable, SkeletonRentalTable } from "@/components/rentalHistory/rental-history-table"
import { RentalDetailDialog } from "@/components/rentalHistory/rental-detail-dialog"
import type { Rental } from "@/components/rentalHistory/rental-history-table"

interface PaginatedData<T> {
  data: T[]
  links: Array<{ url: string | null; label: string; active: boolean }>
  current_page: number
  last_page: number
  total: number
  per_page: number
}

interface RentalsHistoryPageProps {
  rentals?: PaginatedData<Rental>
  filters: {
    search: string | null
    status: string | null
    sort: string | null
    direction: string | null
  }
}

export default function RentalsHistoryPage({
  rentals,
  filters,
}: RentalsHistoryPageProps) {
  const [viewingRental, setViewingRental] = React.useState<Rental | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  const handleReturn = (rental: Rental) => {
    if (!confirm(`Mark rental ${rental.rental_code} as returned?`)) return
    router.post(`/rentals/${rental.id}/return`, {}, {
      onError: () => {},
    })
  }

  const handleCancel = (rental: Rental) => {
    if (!confirm(`Cancel rental ${rental.rental_code}? Stock will be restored.`)) return
    router.post(`/rentals/${rental.id}/cancel`, {}, {
      onError: () => {},
    })
  }

  const handleView = (rental: Rental) => {
    setViewingRental(rental)
    setIsDetailOpen(true)
  }

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
        <Head title="Riwayat Transaksi — SummitRent" />

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
            <p className="text-sm text-muted-foreground">
              View, filter, and manage all rental transaction records.
            </p>
          </div>

          {/* Table */}
          <Deferred data="rentals" fallback={<SkeletonRentalTable />}>
            {rentals ? (
              <RentalHistoryTable
                rentals={rentals}
                filters={filters}
                onReturn={handleReturn}
                onCancel={handleCancel}
                onView={handleView}
              />
            ) : null}
          </Deferred>
        </div>

        {/* Detail Dialog */}
        <RentalDetailDialog
          rental={viewingRental}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onReturn={handleReturn}
          onCancel={handleCancel}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
