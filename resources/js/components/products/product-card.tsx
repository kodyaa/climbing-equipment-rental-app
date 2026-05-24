import * as React from "react"
import { usePage } from "@inertiajs/react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
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
import { Button } from "@/components/ui/button"
import {
  PencilIcon,
  Trash2Icon,
  MoreVerticalIcon,
  PackageIcon,
  LayersIcon,
} from "lucide-react"

import { Product } from "@/types/product"
import { formatCurrency } from "@/lib/format"

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { auth } = usePage<{
    auth?: {
      user?: {
        role?: string
      }
    }
  }>().props

  const isOwner = auth?.user?.role === "owner"

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "available":
        return {
          bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20",
          label: "Available",
          dot: "bg-emerald-500",
        }
      case "maintenance":
        return {
          bg: "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20",
          label: "Maintenance",
          dot: "bg-amber-500",
        }
      case "out_of_stock":
      default:
        return {
          bg: "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20",
          label: "Out of Stock",
          dot: "bg-rose-500",
        }
    }
  }

  const statusInfo = getStatusDetails(product.status)

  return (
    <Card className="@container/card group relative bg-linear-to-t from-primary/5 to-card shadow-xs hover:shadow-md hover:ring-primary/30 transition-all duration-300 overflow-hidden dark:bg-card">
      {/* Product Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 has-[>img:first-child]:pt-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-500">
            <PackageIcon className="size-10 stroke-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <Badge className="absolute top-3 left-3 bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-white text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 flex items-center gap-1.5 shadow-md backdrop-blur-sm">
          <LayersIcon className="size-3 text-primary" />
          {product.category}
        </Badge>

        {/* Actions Dropdown + Delete Alert Dialog */}
        {isOwner && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-lg bg-neutral-950/80 backdrop-blur-md hover:bg-neutral-900 border border-white/10 text-white cursor-pointer shadow-sm"
                >
                  <MoreVerticalIcon className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                  <PencilIcon className="size-3.5 mr-2 text-muted-foreground" />
                  Edit Item
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Trigger the AlertDialog from inside the DropdownMenu */}
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2Icon className="size-3.5 mr-2" />
                    Delete Item
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete &ldquo;{product.name}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this item from your rental inventory. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onDelete(product.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        )}
      </div>

      {/* Card Header — name, description, status badge */}
      <CardHeader>
        <CardDescription>{product.description || "No description provided."}</CardDescription>
        <CardTitle className="text-base font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors @[250px]/card:text-lg">
          {product.name}
        </CardTitle>
        <CardAction>
          <Badge
            variant="outline"
            className={`py-0.5 px-2 rounded-full border text-[10px] font-semibold flex items-center gap-1.5 ${statusInfo.bg}`}
          >
            <span className={`size-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </Badge>
        </CardAction>
      </CardHeader>

      {/* Card Footer — price + stock */}
      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Daily Rate</span>
          <span className="text-sm font-extrabold text-foreground tabular-nums">
            {formatCurrency(product.price_per_day)}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">/ day</span>
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stock</span>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

export function SkeletonCard() {
  return (
    <Card className="@container/card bg-card ring-1 ring-foreground/10 overflow-hidden shadow-xs animate-pulse">
      {/* Product Image Skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Card Header Skeleton */}
      <CardHeader className="relative">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-3/4 animate-none" />
          <Skeleton className="h-4.5 w-1/2 mt-1 animate-none" />
        </div>
        <CardAction>
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardAction>
      </CardHeader>

      {/* Card Footer Skeleton */}
      <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-16 animate-none" />
          <Skeleton className="h-4 w-28 animate-none" />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <Skeleton className="h-2.5 w-10 animate-none" />
          <Skeleton className="h-4 w-16 animate-none" />
        </div>
      </CardFooter>
    </Card>
  )
}
