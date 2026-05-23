import * as React from "react"
import { Head, router, Deferred } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductCard, SkeletonCard } from "@/components/products/product-card"
import { ProductDialog } from "@/components/products/product-dialog"
import { toast } from "sonner"
import { PlusIcon, SearchIcon, SlidersHorizontalIcon, PackageIcon, MountainSnowIcon } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

interface Product {
  id: number
  name: string
  category: string
  description: string | null
  price_per_day: number | string
  stock: number
  status: string
  image: string | null
}

interface PaginatedData<T> {
  data: T[]
  links: Array<{ url: string | null; label: string; active: boolean }>
  current_page: number
  last_page: number
  total: number
  per_page: number
}

interface ProductsPageProps {
  products?: PaginatedData<Product>
  filters: {
    search: string | null
    category: string | null
    status: string | null
    sort: string | null
    direction: string | null
  }
}

export default function ProductsPage({ products, filters }: ProductsPageProps) {
  // Dialog modal states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)

  // Filtering states
  const [searchVal, setSearchVal] = React.useState(filters.search || "")
  const [categoryFilter, setCategoryFilter] = React.useState(filters.category || "all")
  const [statusFilter, setStatusFilter] = React.useState(filters.status || "all")
  const [sortBy, setSortBy] = React.useState(filters.sort || "id")
  const [sortDir, setSortDir] = React.useState(filters.direction || "desc")

  // Debounced server-side query state syncing
  React.useEffect(() => {
    const hasChanged =
      searchVal !== (filters.search || "") ||
      categoryFilter !== (filters.category || "all") ||
      statusFilter !== (filters.status || "all") ||
      sortBy !== (filters.sort || "id") ||
      sortDir !== (filters.direction || "desc")

    if (!hasChanged) {
      return
    }

    const delayDebounceFn = setTimeout(() => {
      const queryParams: Record<string, string> = {}

      if (searchVal.trim()) queryParams.search = searchVal
      if (categoryFilter !== "all") queryParams.category = categoryFilter
      if (statusFilter !== "all") queryParams.status = statusFilter
      if (sortBy !== "id") queryParams.sort = sortBy
      if (sortDir !== "desc") queryParams.direction = sortDir

      router.get("/products", queryParams, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchVal, categoryFilter, statusFilter, sortBy, sortDir, filters])

  // Pagination handler functions
  const navigatePage = (pageNum: number) => {
    const queryParams: Record<string, any> = { page: pageNum }
    
    if (searchVal.trim()) queryParams.search = searchVal
    if (categoryFilter !== "all") queryParams.category = categoryFilter
    if (statusFilter !== "all") queryParams.status = statusFilter
    if (sortBy !== "id") queryParams.sort = sortBy
    if (sortDir !== "desc") queryParams.direction = sortDir

    router.get("/products", queryParams, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  // Edit / Delete triggers
  const handleCreate = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod)
    setIsDialogOpen(true)
    toast.info(`Editing ${prod.name}...`)
  }

  const handleDelete = (id: number) => {
    router.delete(`/products/${id}`, {
      onError: () => {
        toast.error('Failed to delete product.')
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
        
        <Head title="Products - SummitRent by Kodya" />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Header Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 lg:px-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight">Rental Inventory</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage outdoor gears, mountain climbing kits, tents, and rate settings.
                  </p>
                </div>
                <div>
                  <Button onClick={handleCreate} className="flex items-center gap-1.5 cursor-pointer">
                    <PlusIcon className="size-4" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Filters and Search Bar Options */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-input">
                  <InputGroup className="flex-1 max-w-md h-9">
                    <InputGroupAddon align="inline-start">
                      <SearchIcon className="size-4 text-muted-foreground ml-2"/>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Search equipment or brand details..."
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                    />
                  </InputGroup>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Category Select Filter */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Category:</span>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-32.5 h-8 text-xs text-foreground bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Tent">Tent</SelectItem>
                          <SelectItem value="Backpack">Backpack</SelectItem>
                          <SelectItem value="Sleeping Bag">Sleeping Bag</SelectItem>
                          <SelectItem value="Footwear">Footwear</SelectItem>
                          <SelectItem value="Cooking Gear">Cooking Gear</SelectItem>
                          <SelectItem value="Climbing Gear">Climbing Gear</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Select Filter */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Status:</span>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-30 h-8 text-xs text-foreground bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort field and direction */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l pl-3 ml-1 border-input">
                      <SlidersHorizontalIcon className="size-3.5" />
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-27.5 h-8 text-xs text-foreground bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Date Created</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price_per_day">Price</SelectItem>
                          <SelectItem value="stock">Stock Count</SelectItem>
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
                  </div>
                </div>
              </div>

              {/* Cards Grid Content */}
              <div className="px-4 lg:px-6">
                <Deferred
                  data="products"
                  fallback={
                    <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonCard key={index} />
                      ))}
                    </div>
                  }
                >
                  {products ? (
                    <>
                      {products.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-4">
                          {products.data.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      ) : (
                        <Empty className="relative overflow-hidden rounded-2xl border border-dashed border-input bg-linear-to-br from-card via-card to-primary/5 py-20 px-8">
                          {/* Decorative blobs */}
                          <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-primary/5 blur-3xl" />
                          <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-primary/5 blur-3xl" />

                          <EmptyHeader>
                            <EmptyMedia>
                              {/* Glowing ring icon */}
                              <div className="relative flex items-center justify-center">
                                <div className="absolute size-24 rounded-full bg-primary/10 blur-xl" />
                                <div className="relative flex size-20 items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10">
                                  <MountainSnowIcon className="size-9 text-primary" strokeWidth={1.5} />
                                </div>
                              </div>
                            </EmptyMedia>
                            <EmptyTitle className="text-base font-semibold text-foreground mt-2">
                              No equipment found
                            </EmptyTitle>
                            <EmptyDescription className="max-w-xs">
                              No climbing gear matched your search. Clear filters or add your first item to the inventory.
                            </EmptyDescription>
                          </EmptyHeader>

                          <EmptyContent>
                            <Button onClick={handleCreate} className="gap-2 cursor-pointer mt-2">
                              <PlusIcon data-icon="inline-start" />
                              Add Equipment
                            </Button>
                          </EmptyContent>
                        </Empty>
                      )}

                      {/* Pagination Controls */}
                      {products.last_page > 1 && (
                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-input">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage(products.current_page - 1)}
                            disabled={products.current_page === 1}
                            className="cursor-pointer"
                          >
                            Previous
                          </Button>
                          <span className="text-xs text-muted-foreground px-2">
                            Page {products.current_page} of {products.last_page}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage(products.current_page + 1)}
                            disabled={products.current_page === products.last_page}
                            className="cursor-pointer"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  ) : null}
                </Deferred>
              </div>

            </div>
          </div>
        </div>

        {/* Dialog Form Modal */}
        <ProductDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingProduct={editingProduct}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
