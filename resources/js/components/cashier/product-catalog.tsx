import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchIcon, PlusIcon, CheckIcon, PackageIcon } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"

import { Product } from "@/types/product"
import { formatCurrency } from "@/lib/format"

interface ProductCatalogProps {
  products: Product[]
  cartProductIds: number[]
  onAddToCart: (product: Product) => void
}

const CATEGORIES = [
  "Tent",
  "Backpack",
  "Sleeping Bag",
  "Footwear",
  "Cooking Gear",
  "Climbing Gear",
]

function ProductCard({
  product,
  isInCart,
  onAdd,
}: {
  product: Product
  isInCart: boolean
  onAdd: (p: Product) => void
}) {
  const outOfStock = product.stock === 0
  const hasImage = !!product.image

  return (
    <div
      onClick={outOfStock ? undefined : () => onAdd(product)}
      className={[
        "group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200",
        isInCart
          ? "border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/20 cursor-pointer"
          : outOfStock
          ? "opacity-60 border-input"
          : "border-input hover:border-primary/30 hover:shadow-sm cursor-pointer",
      ].join(" ")}
    >
      {/* Product image / placeholder */}
      <div className="relative aspect-4/3 bg-muted/40 overflow-hidden">
        {hasImage ? (
          <img
            src={product.image!}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageIcon className="size-10 text-muted-foreground/25" strokeWidth={1.5} />
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className={`text-xs font-medium ${outOfStock ? "bg-destructive/10 text-destructive" : ""}`}
          >
            {outOfStock ? "Out of stock" : `${product.stock} left`}
          </Badge>
        </div>

      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-[10px] py-0 px-1.5">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</h3>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">per day</span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(product.price_per_day)}
            </span>
          </div>

          <Button
            size="icon"
            className="size-8 rounded-full cursor-pointer shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onAdd(product)
            }}
            disabled={outOfStock}
            variant={isInCart ? "secondary" : "default"}
            title={isInCart ? "Remove from cart" : "Add to cart"}
          >
            {isInCart ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <PlusIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ProductCatalog({ products, cartProductIds, onAddToCart }: ProductCatalogProps) {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState("all")

  const filtered = products.filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "all" || p.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2 pt-1">
        <InputGroup className="flex-1 h-9">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-4 text-muted-foreground ml-2" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44 h-9 text-sm bg-card shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
        <span>
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          {search || category !== "all" ? " (filtered)" : " available"}
        </span>
        {cartProductIds.length > 0 && (
          <span className="text-primary font-medium">
            {cartProductIds.length} in cart
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Empty className="py-12 border border-dashed border-muted-foreground/20 rounded-xl">
          <EmptyHeader>
            <EmptyMedia>
              <PackageIcon className="size-8 text-muted-foreground/30" strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>No products match your search or filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInCart={cartProductIds.includes(product.id)}
              onAdd={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
