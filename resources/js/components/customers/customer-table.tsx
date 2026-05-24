import * as React from "react"
import { router } from "@inertiajs/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  PencilIcon,
  Trash2Icon,
  UserPlusIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  MapPinIcon,
  ClipboardListIcon,
} from "lucide-react"

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

interface CustomerTableProps {
  customers: PaginatedData<Customer>
  filters: {
    search: string | null
    sort: string | null
    direction: string | null
  }
  handleEdit: (cust: Customer) => void
  handleDelete: (id: number) => void
  handleCreate: () => void
}

export function CustomerTable({
  customers,
  filters,
  handleEdit,
  handleDelete,
  handleCreate,
}: CustomerTableProps) {
  const [searchVal, setSearchVal] = React.useState(filters.search || "")
  const [visibleColumns, setVisibleColumns] = React.useState({
    phone: true,
    email: true,
    region: true,
    rentals: true,
    actions: true,
  })
  const [selectedIds, setSelectedIds] = React.useState<number[]>([])

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchVal !== (filters.search || "")) {
        router.get(
          "/customers",
          {
            search: searchVal,
            sort: filters.sort || "id",
            direction: filters.direction || "desc",
          },
          { preserveState: true, preserveScroll: true, replace: true }
        )
      }
    }, 400)
    return () => clearTimeout(delayDebounceFn)
  }, [searchVal, filters.sort, filters.direction])

  // Pagination handlers
  const handlePrevPage = () => {
    if (customers.current_page > 1) {
      router.get(
        "/customers",
        {
          page: customers.current_page - 1,
          search: searchVal,
          sort: filters.sort || "id",
          direction: filters.direction || "desc",
        },
        { preserveState: true, preserveScroll: true }
      )
    }
  }

  const handleNextPage = () => {
    if (customers.current_page < customers.last_page) {
      router.get(
        "/customers",
        {
          page: customers.current_page + 1,
          search: searchVal,
          sort: filters.sort || "id",
          direction: filters.direction || "desc",
        },
        { preserveState: true, preserveScroll: true }
      )
    }
  }

  // Sorting handler
  const handleSort = (key: "name" | "email" | "phone") => {
    let nextDir: "asc" | "desc" = "asc"
    if (filters.sort === key) {
      nextDir = filters.direction === "asc" ? "desc" : "asc"
    }
    router.get(
      "/customers",
      {
        search: searchVal,
        sort: key,
        direction: nextDir,
      },
      { preserveState: true, preserveScroll: true }
    )
  }

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = customers.data.map((c) => c.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
    } else {
      const currentPageIds = customers.data.map((c) => c.id)
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const isAllCurrentPageSelected =
    customers.data.length > 0 &&
    customers.data.every((c) => selectedIds.includes(c.id))

  return (
    <div className="flex flex-col gap-4">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Filter customers by name, phone, or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1.5 ml-auto text-xs">
                Columns
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuCheckboxItem
                checked={visibleColumns.phone}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, phone: !!checked }))
                }
              >
                Phone
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.email}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, email: !!checked }))
                }
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.region}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, region: !!checked }))
                }
              >
                Region & Address
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.rentals}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, rentals: !!checked }))
                }
              >
                Rentals Count
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.actions}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, actions: !!checked }))
                }
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleCreate} className="flex items-center gap-1.5 text-xs">
            <UserPlusIcon className="size-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="-ml-2 hover:bg-transparent text-foreground flex items-center gap-1 font-semibold text-xs"
                >
                  Name
                  <ArrowUpDownIcon className="size-3.5" />
                </Button>
              </TableHead>
              {visibleColumns.phone && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("phone")}
                    className="-ml-2 hover:bg-transparent text-foreground flex items-center gap-1 font-semibold text-xs"
                  >
                    Phone
                    <ArrowUpDownIcon className="size-3.5" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.email && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="-ml-2 hover:bg-transparent text-foreground flex items-center gap-1 font-semibold text-xs"
                  >
                    Email / ID Number
                  </Button>
                </TableHead>
              )}
              {visibleColumns.region && <TableHead className="font-semibold text-xs">Region & Address</TableHead>}
              {visibleColumns.rentals && (
                <TableHead className="font-semibold text-xs text-center w-28">Rentals</TableHead>
              )}
              {visibleColumns.actions && <TableHead className="text-right pr-4 font-semibold text-xs w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.data.length > 0 ? (
              customers.data.map((cust) => (
                <TableRow
                  key={cust.id}
                  data-state={selectedIds.includes(cust.id) ? "selected" : undefined}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selectedIds.includes(cust.id)}
                      onCheckedChange={(checked) => handleSelectRow(cust.id, !!checked)}
                      aria-label={`Select row ${cust.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-xs">{cust.name}</span>
                      {cust.id_number && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {cust.id_number}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {visibleColumns.phone && (
                    <TableCell className="text-xs font-medium">{cust.phone}</TableCell>
                  )}
                  {visibleColumns.email && (
                    <TableCell className="text-xs text-muted-foreground">{cust.email || "—"}</TableCell>
                  )}
                  {visibleColumns.region && (
                    <TableCell>
                      <div className="flex flex-col max-w-50 xl:max-w-70">
                        {cust.wilayah ? (
                          <div className="flex items-center gap-1 text-xs text-primary font-medium">
                            <MapPinIcon className="size-3.5 shrink-0" />
                            <span className="truncate">{cust.wilayah.nama_lengkap || cust.wilayah.nama}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No region</span>
                        )}
                        {cust.address && (
                          <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {cust.address}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.rentals && (
                    <TableCell className="text-center font-medium text-xs">
                      <div className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[11px]">
                        <ClipboardListIcon className="size-3" />
                        <span>{cust.rentals_count}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell className="text-right pr-4">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs" className="size-8 p-0">
                              <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => handleEdit(cust)}>
                              <PencilIcon className="size-3.5 mr-2 text-muted-foreground" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2Icon className="size-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                              <Trash2Icon />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{cust.name}&rdquo;? All rental history linked to this customer might be affected.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(cust.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-xs">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-xs text-muted-foreground">
          {selectedIds.length} of {customers.total} customer(s) selected.
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={customers.current_page === 1 || customers.total === 0}
            className="text-xs h-8"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {customers.last_page > 0 ? customers.current_page : 0} of {customers.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={customers.current_page === customers.last_page || customers.total === 0}
            className="text-xs h-8"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SkeletonCustomerTable() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Top Filter and Actions Row Mockup */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Table Mockup */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-4">
            <Skeleton className="size-4 rounded-xs shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-32 shrink-0 hidden md:block" />
            <Skeleton className="h-4 w-20 shrink-0 hidden sm:block" />
            <Skeleton className="h-4 w-12 shrink-0 ml-auto" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="px-4 py-4 flex items-center gap-4" key={index}>
              <Skeleton className="size-4 rounded-xs shrink-0" />
              <div className="flex flex-col gap-1.5 shrink-0">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-14" />
              </div>
              <div className="h-3.5 w-24 hidden md:block shrink-0" />
              <div className="h-3.5 w-32 hidden sm:block shrink-0" />
              <Skeleton className="size-8 rounded-md ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
