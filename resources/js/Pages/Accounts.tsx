import * as React from "react"
import { Head, router, Deferred } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AccountDialog } from "@/components/accounts/account-dialog"
import { AccountTable, SkeletonTable } from "@/components/accounts/account-table"
import { toast } from "sonner"

interface Account {
  id: number
  name: string
  email: string
  phone: string
  country: string
  address: string
  avatar: string | null
}

interface PaginatedData<T> {
  data: T[]
  links: Array<{ url: string | null; label: string; active: boolean }>
  current_page: number
  last_page: number
  total: number
  per_page: number
}

interface AccountsPageProps {
  accounts?: PaginatedData<Account>
  filters: {
    search: string | null
    sort: string | null
    direction: string | null
  }
}

export default function AccountsPage({ accounts, filters }: AccountsPageProps) {

  // Dialog open/close state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Edit state
  const [editingUser, setEditingUser] = React.useState<Account | null>(null)

  // Trigger create modal
  const handleCreate = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  // Populate form for editing
  const handleEdit = (acc: Account) => {
    setEditingUser(acc)
    setIsDialogOpen(true)
    toast.info(`Editing ${acc.name}...`)
  }

  // Delete account
  const handleDelete = (id: number) => {
    router.delete(`/accounts/${id}`, {
      onError: () => {
        toast.error('Failed to delete account.')
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
        
        <Head title="Accounts - SummitRent by Kodya" />

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Accounts Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage mountain climbing cashiers, administrators, and profile parameters.
            </p>
          </div>

          <div className="w-full">
            <Deferred data="accounts" fallback={<SkeletonTable />}>
              {accounts ? (
                <AccountTable
                  accounts={accounts}
                  filters={filters}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleCreate={handleCreate}
                />
              ) : null}
            </Deferred>
          </div>
        </div>

        {/* Modal Dialog Form Component */}
        <AccountDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingUser={editingUser}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
