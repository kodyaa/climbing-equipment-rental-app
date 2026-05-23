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
  CircleUserRoundIcon,
  PencilIcon,
  Trash2Icon,
  UserPlusIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  MoreHorizontalIcon
} from "lucide-react"

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

interface AccountTableProps {
  accounts: PaginatedData<Account>
  filters: {
    search: string | null
    sort: string | null
    direction: string | null
  }
  handleEdit: (acc: Account) => void
  handleDelete: (id: number) => void
  handleCreate: () => void
}

export function AccountTable({
  accounts,
  filters,
  handleEdit,
  handleDelete,
  handleCreate,
}: AccountTableProps) {
  // Local state for search/filtering input
  const [searchVal, setSearchVal] = React.useState(filters.search || "")

  // Local state for column visibility
  const [visibleColumns, setVisibleColumns] = React.useState({
    contact: true,
    location: true,
    actions: true,
  })

  // Local state for row selection (remains client-side)
  const [selectedIds, setSelectedIds] = React.useState<number[]>([])

  // Debounced server-side search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchVal !== (filters.search || "")) {
        router.get(
          "/accounts",
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

  // Server-side pagination handlers
  const handlePrevPage = () => {
    if (accounts.current_page > 1) {
      router.get(
        "/accounts",
        {
          page: accounts.current_page - 1,
          search: searchVal,
          sort: filters.sort || "id",
          direction: filters.direction || "desc",
        },
        { preserveState: true, preserveScroll: true }
      )
    }
  }

  const handleNextPage = () => {
    if (accounts.current_page < accounts.last_page) {
      router.get(
        "/accounts",
        {
          page: accounts.current_page + 1,
          search: searchVal,
          sort: filters.sort || "id",
          direction: filters.direction || "desc",
        },
        { preserveState: true, preserveScroll: true }
      )
    }
  }

  // Server-side sort handler
  const handleSort = (key: "name" | "email") => {
    let nextDir: "asc" | "desc" = "asc"
    if (filters.sort === key) {
      nextDir = filters.direction === "asc" ? "desc" : "asc"
    }
    router.get(
      "/accounts",
      {
        search: searchVal,
        sort: key,
        direction: nextDir,
      },
      { preserveState: true, preserveScroll: true }
    )
  }

  // Handle Select All on Current Page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = accounts.data.map((acc) => acc.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
    } else {
      const currentPageIds = accounts.data.map((acc) => acc.id)
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
    }
  }

  // Handle Select Single Row
  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  // Check if all rows on the current page are selected
  const isAllCurrentPageSelected =
    accounts.data.length > 0 &&
    accounts.data.every((acc) => selectedIds.includes(acc.id))

  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Filter emails or names..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 justify-end">
          {/* Columns Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1.5 ml-auto">
                Columns
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuCheckboxItem
                checked={visibleColumns.contact}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, contact: !!checked }))
                }
              >
                Contact
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.location}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, location: !!checked }))
                }
              >
                Location
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

          <Button onClick={handleCreate} className="flex items-center gap-1.5">
            <UserPlusIcon className="size-4" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Main Table Wrapper */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12.5 pl-4">
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
                  className="-ml-2 hover:bg-transparent text-foreground flex items-center gap-1 font-semibold"
                >
                  Name
                  <ArrowUpDownIcon className="size-3.5" />
                </Button>
              </TableHead>
              {visibleColumns.contact && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="-ml-2 hover:bg-transparent text-foreground flex items-center gap-1 font-semibold"
                  >
                    Email
                    <ArrowUpDownIcon className="size-3.5" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.location && <TableHead className="font-semibold">Location</TableHead>}
              {visibleColumns.actions && <TableHead className="text-right pr-4 font-semibold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.data.length > 0 ? (
              accounts.data.map((acc) => (
                <TableRow
                  key={acc.id}
                  data-state={selectedIds.includes(acc.id) ? "selected" : undefined}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selectedIds.includes(acc.id)}
                      onCheckedChange={(checked) => handleSelectRow(acc.id, !!checked)}
                      aria-label={`Select row ${acc.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full overflow-hidden border bg-neutral-900 shadow-xs shrink-0 flex items-center justify-center">
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.name} className="size-8 object-cover" />
                        ) : (
                          <CircleUserRoundIcon className="size-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground leading-none">{acc.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">
                          {acc.email.includes("admin") ? "Admin" : "Cashier"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {visibleColumns.contact && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{acc.email}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{acc.phone || "-"}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.location && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold">{acc.country}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-37.5">{acc.address || "-"}</span>
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
                            <DropdownMenuItem onClick={() => handleEdit(acc)}>
                              <PencilIcon className="size-3.5 mr-2 text-muted-foreground" />
                              Edit Account
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2Icon className="size-3.5 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                              <Trash2Icon />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Delete &ldquo;{acc.name}&rdquo;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this account. All associated data will be lost and cannot be recovered.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(acc.id)}
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
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Pagination & Selection Summary Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-xs text-muted-foreground">
          {selectedIds.length} of {accounts.total} row(s) selected.
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={accounts.current_page === 1 || accounts.total === 0}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {accounts.last_page > 0 ? accounts.current_page : 0} of {accounts.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={accounts.current_page === accounts.last_page || accounts.total === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable() {
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
              {/* Checkbox */}
              <Skeleton className="size-4 rounded-xs shrink-0" />
              
              {/* Name & Avatar */}
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="flex-col gap-1.5 hidden md:flex shrink-0">
                <Skeleton className="h-3 w-40 animate-none" />
                <Skeleton className="h-2.5 w-24 animate-none" />
              </div>

              {/* Location */}
              <div className="flex-col gap-1.5 hidden sm:flex shrink-0">
                <Skeleton className="h-3 w-16 animate-none" />
                <Skeleton className="h-2.5 w-32 animate-none" />
              </div>

              {/* Actions */}
              <Skeleton className="size-8 rounded-md ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Mockup */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}
