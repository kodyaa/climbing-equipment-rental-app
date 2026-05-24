import * as React from "react"
import { Head, router, Deferred } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { CustomerTable, SkeletonCustomerTable } from "@/components/customers/customer-table"
import { toast } from "sonner"

import { Customer } from "@/types/customer"
import { Wilayah } from "@/types/wilayah"


interface PaginatedData<T> {
  data: T[]
  links: Array<{ url: string | null; label: string; active: boolean }>
  current_page: number
  last_page: number
  total: number
  per_page: number
}

interface CustomersPageProps {
  customers?: PaginatedData<Customer>
  filters: {
    search: string | null
    sort: string | null
    direction: string | null
  }
}

export default function CustomersPage({ customers, filters }: CustomersPageProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null)

  const handleCreate = () => {
    setEditingCustomer(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (cust: Customer) => {
    setEditingCustomer(cust)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    router.delete(`/customers/${id}`, {
      onSuccess: () => {
        toast.success("Customer deleted successfully.")
      },
      onError: () => {
        toast.error("Failed to delete customer.")
      },
    })
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

        <Head title="Customers — SummitRent" />

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Manage equipment rental customers, details, and regional location associations.
            </p>
          </div>

          {/* Table */}
          <div className="w-full">
            <Deferred data="customers" fallback={<SkeletonCustomerTable />}>
              {customers ? (
                <CustomerTable
                  customers={customers}
                  filters={filters}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleCreate={handleCreate}
                />
              ) : null}
            </Deferred>
          </div>
        </div>

        {/* Modal Dialog */}
        <CustomerDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCustomer={editingCustomer}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
