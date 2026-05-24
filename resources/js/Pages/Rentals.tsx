import * as React from "react"
import { Head, router } from "@inertiajs/react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProductCatalog } from "@/components/cashier/product-catalog"
import { OrderCart } from "@/components/cashier/order-cart"
import type { CartItem } from "@/components/cashier/order-cart"
import { Product } from "@/types/product"
import { Customer } from "@/types/customer"

interface RentalsPageProps {
  availableProducts?: Product[]
  customers?: Customer[]
}

const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

const calculateDays = (fromStr: string, untilStr: string): number => {
  if (!fromStr || !untilStr) return 1
  const from = new Date(fromStr)
  const until = new Date(untilStr)
  const diffTime = until.getTime() - from.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 1
}

export default function RentalsPage({
  availableProducts = [],
  customers = [],
}: RentalsPageProps) {
  const today = new Date().toISOString().split("T")[0]

  // Cart state
  const [cartItems, setCartItems] = React.useState<CartItem[]>([])
  const [customerId, setCustomerId] = React.useState("")
  const [rentalDate, setRentalDate] = React.useState(today)
  const [expectedReturnDate, setExpectedReturnDate] = React.useState(addDays(today, 1))
  const [notes, setNotes] = React.useState("")
  const [processing, setProcessing] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const cartProductIds = cartItems.map((i) => i.productId)

  const handleRentalDateChange = (date: string) => {
    setRentalDate(date)
    if (expectedReturnDate) {
      const days = calculateDays(date, expectedReturnDate)
      setCartItems((prev) =>
        prev.map((item) => ({ ...item, durationDays: days }))
      )
    } else {
      setExpectedReturnDate(addDays(date, 1))
    }
  }

  const handleExpectedReturnDateChange = (date: string) => {
    setExpectedReturnDate(date)
    if (date && rentalDate) {
      const days = calculateDays(rentalDate, date)
      setCartItems((prev) =>
        prev.map((item) => ({ ...item, durationDays: days }))
      )
    }
  }

  const handleAddToCart = (product: Product) => {
    // Toggle: if already in cart, remove it
    if (cartProductIds.includes(product.id)) {
      setCartItems((prev) => prev.filter((i) => i.productId !== product.id))
      return
    }
    const currentDuration = expectedReturnDate ? calculateDays(rentalDate, expectedReturnDate) : 1
    setCartItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        pricePerDay: Number(product.price_per_day),
        maxStock: product.stock,
        quantity: 1,
        durationDays: currentDuration,
      },
    ])
  }

  const handleUpdateItem = (
    productId: number,
    field: "quantity" | "durationDays",
    value: number
  ) => {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId ? { ...item, [field]: value } : item
      )

      if (field === "durationDays") {
        const newReturnDate = addDays(rentalDate, value)
        setExpectedReturnDate(newReturnDate)
        // Keep all items synced with the new duration
        return updated.map((item) => ({ ...item, durationDays: value }))
      }

      return updated
    })
  }

  const handleRemoveItem = (productId: number) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const handleCheckout = () => {
    setProcessing(true)
    setErrors({})

    router.post(
      "/rentals",
      {
        customer_id: customerId,
        rental_date: rentalDate,
        expected_return_date: expectedReturnDate,
        notes,
        items: cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          duration_days: item.durationDays,
        })),
      },
      {
        onSuccess: () => {
          setCartItems([])
          setCustomerId("")
          setExpectedReturnDate(addDays(today, 1))
          setNotes("")
          setProcessing(false)
          toast.success("Rental transaction created successfully!")
        },
        onError: (errs) => {
          setErrors(errs as Record<string, string>)
          setProcessing(false)
          toast.error("Please fix the errors and try again.")
        },
      }
    )
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
      <SidebarInset className="overflow-hidden">
        <SiteHeader />
        <Head title="Kasir — SummitRent" />

        {/* Two-Column POS Layout */}
        <div className="flex h-[calc(100dvh-var(--header-height))] overflow-hidden">

          {/* ── Left: Product Catalog ─────────────────── */}
          <div className="flex-1 min-w-0 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Kasir</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Select equipment and proceed to checkout.
              </p>
            </div>

            <ProductCatalog
              products={availableProducts}
              cartProductIds={cartProductIds}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* ── Right: Order Cart ─────────────────────── */}
          <div className="w-72 xl:w-80 2xl:w-96 shrink-0 flex flex-col overflow-hidden">
            <OrderCart
              items={cartItems}
              customers={customers}
              customerId={customerId}
              rentalDate={rentalDate}
              expectedReturnDate={expectedReturnDate}
              notes={notes}
              errors={errors}
              processing={processing}
              onCustomerChange={setCustomerId}
              onRentalDateChange={handleRentalDateChange}
              onExpectedReturnDateChange={handleExpectedReturnDateChange}
              onNotesChange={setNotes}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
