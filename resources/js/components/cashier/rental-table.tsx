import * as React from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SearchIcon,
  SlidersHorizontalIcon,
  PlusIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  XCircleIcon,
  EyeIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  BanIcon,
} from "lucide-react"

import { Rental } from "@/types/rental"
import { formatCurrency, formatDate } from "@/lib/format"

interface PaginatedData<T> {
  data: T[]
  links: Array<{ url: string | null; label: string; active: boolean }>
  current_page: number
  last_page: number
  total: number
  per_page: number
}

interface RentalTableProps {
  rentals: PaginatedData<Rental>
  filters: {
    search: string | null
    status: string | null
    sort: string | null
    direction: string | null
  }
  onNew: () => void
  onReturn: (rental: Rental) => void
  onCancel: (rental: Rental) => void
  onView: (rental: Rental) => void
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    variant: "default" as const,
    icon: ClockIcon,
    className: "bg-blue-500/15 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  returned: {
    label: "Returned",
    variant: "outline" as const,
    icon: CheckCircle2Icon,
    className: "bg-green-500/15 text-green-600 border-green-500/20 dark:text-green-400",
  },
  overdue: {
    label: "Overdue",
    variant: "destructive" as const,
    icon: AlertCircleIcon,
    className: "bg-red-500/15 text-red-600 border-red-500/20 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    icon: BanIcon,
    className: "bg-muted text-muted-foreground border-input",
  },
}

function StatusBadge({ status }: { status: Rental["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={`gap-1.5 text-xs font-medium ${cfg.className}`}>
      <Icon className="size-3" />
      {cfg.label}
    </Badge>
  )
}

export function RentalTable({
  rentals,
  filters,
  onNew,
  onReturn,
  onCancel,
  onView,
}: RentalTableProps) {
  const [searchVal, setSearchVal] = React.useState(filters.search || "")
  const [statusFilter, setStatusFilter] = React.useState(filters.status || "all")
  const [sortBy, setSortBy] = React.useState(filters.sort || "id")
  const [sortDir, setSortDir] = React.useState(filters.direction || "desc")

  React.useEffect(() => {
    const hasChanged =
      searchVal !== (filters.search || "") ||
      statusFilter !== (filters.status || "all") ||
      sortBy !== (filters.sort || "id") ||
      sortDir !== (filters.direction || "desc")

    if (!hasChanged) return

    const timer = setTimeout(() => {
      const params: Record<string, string> = {}
      if (searchVal.trim()) params.search = searchVal
      if (statusFilter !== "all") params.status = statusFilter
      if (sortBy !== "id") params.sort = sortBy
      if (sortDir !== "desc") params.direction = sortDir

      router.get("/rentals", params, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [searchVal, statusFilter, sortBy, sortDir, filters])

  const navigatePage = (page: number) => {
    const params: Record<string, any> = { page }
    if (searchVal.trim()) params.search = searchVal
    if (statusFilter !== "all") params.status = statusFilter
    if (sortBy !== "id") params.sort = sortBy
    if (sortDir !== "desc") params.direction = sortDir
    router.get("/rentals", params, { preserveState: true, preserveScroll: true })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-input">
        <InputGroup className="flex-1 max-w-md h-9">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-4 text-muted-foreground ml-2" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by code or customer name..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </InputGroup>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 text-xs text-foreground bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l pl-3 border-input">
            <SlidersHorizontalIcon className="size-3.5" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8 text-xs text-foreground bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Date Created</SelectItem>
                <SelectItem value="rental_date">Rental Date</SelectItem>
                <SelectItem value="expected_return_date">Return Date</SelectItem>
                <SelectItem value="total_price">Total Price</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(val: "asc" | "desc") => setSortDir(val)}>
              <SelectTrigger className="w-20 h-8 text-xs text-foreground bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onNew} size="sm" className="gap-1.5 cursor-pointer h-8">
            <PlusIcon className="size-3.5" />
            New Rental
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-input overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Rental Date</TableHead>
              <TableHead className="font-semibold">Return Date</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentals.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  No rental transactions found.
                </TableCell>
              </TableRow>
            ) : (
              rentals.data.map((rental) => (
                <TableRow key={rental.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-medium text-primary">
                    {rental.rental_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{rental.customer?.name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{rental.customer?.phone ?? ""}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(rental.rental_date, "short")}</TableCell>
                  <TableCell className="text-sm">{formatDate(rental.expected_return_date, "short")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {rental.items.length} item{rental.items.length !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {formatCurrency(rental.total_price)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={rental.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onView(rental)}>
                          <EyeIcon className="size-4" /> View Details
                        </DropdownMenuItem>
                        {rental.status === "active" || rental.status === "overdue" ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-green-600 focus:text-green-600"
                              onClick={() => onReturn(rental)}
                            >
                              <RotateCcwIcon className="size-4" /> Mark Returned
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              onClick={() => onCancel(rental)}
                            >
                              <XCircleIcon className="size-4" /> Cancel
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {rentals.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {rentals.total} total transactions
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePage(rentals.current_page - 1)}
              disabled={rentals.current_page === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {rentals.current_page} of {rentals.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePage(rentals.current_page + 1)}
              disabled={rentals.current_page === rentals.last_page}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SkeletonRentalTable() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="rounded-xl border border-input overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {["Code", "Customer", "Rental Date", "Return Date", "Items", "Total", "Status", ""].map((h) => (
                <TableHead key={h} className="font-semibold">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
