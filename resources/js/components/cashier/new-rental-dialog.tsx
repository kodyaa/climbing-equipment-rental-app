import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  PlusIcon,
  TrashIcon,
  PackageIcon,
  UserIcon,
  CalendarIcon,
} from "lucide-react"

import { Customer } from "@/types/customer"
import { Product } from "@/types/product"
import { useRentalForm } from "@/hooks/use-rental-form"
import { formatCurrency } from "@/lib/format"

interface NewRentalDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
  availableProducts: Product[]
}

export function NewRentalDialog({
  isOpen,
  onOpenChange,
  customers,
  availableProducts,
}: NewRentalDialogProps) {
  const {
    data,
    setData,
    errors,
    processing,
    addItem,
    removeItem,
    updateItem,
    totalPreview,
    handleSubmit,
  } = useRentalForm({
    isOpen,
    onOpenChange,
    availableProducts,
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <PackageIcon className="size-5 text-primary" />
            New Rental Transaction
          </DialogTitle>
          <DialogDescription>
            Create a new rental transaction for a customer.
          </DialogDescription>
        </DialogHeader>

        <form id="new-rental-form" onSubmit={handleSubmit}>
          <FieldGroup className="grid gap-5">
            {/* Customer & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field className="col-span-full">
                <FieldLabel className="flex items-center gap-1.5">
                  <UserIcon className="size-3.5" /> Customer
                </FieldLabel>
                <Select
                  value={data.customer_id}
                  onValueChange={(val) => setData("customer_id", val)}
                >
                  <SelectTrigger id="customer-select" className="w-full">
                    <SelectValue placeholder="Select a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} — {c.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customer_id && <FieldError>{errors.customer_id}</FieldError>}
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" /> Rental Date
                </FieldLabel>
                <Input
                  id="rental-date"
                  type="date"
                  value={data.rental_date}
                  onChange={(e) => setData("rental_date", e.target.value)}
                />
                {errors.rental_date && <FieldError>{errors.rental_date}</FieldError>}
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" /> Expected Return
                </FieldLabel>
                <Input
                  id="return-date"
                  type="date"
                  value={data.expected_return_date}
                  min={data.rental_date}
                  onChange={(e) => setData("expected_return_date", e.target.value)}
                />
                {errors.expected_return_date && (
                  <FieldError>{errors.expected_return_date}</FieldError>
                )}
              </Field>
            </div>

            <Separator />

            {/* Rental Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rental Items
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="h-8 gap-1.5 cursor-pointer text-xs"
                >
                  <PlusIcon className="size-3.5" /> Add Item
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {data.items.map((item, index) => {
                  const selectedProduct = availableProducts.find(
                    (p) => p.id === Number(item.product_id)
                  )
                  const itemSubtotal = selectedProduct
                    ? Number(selectedProduct.price_per_day) *
                      item.quantity *
                      item.duration_days
                    : 0

                  return (
                    <div
                      key={index}
                      className="relative flex flex-col gap-3 rounded-xl border border-input p-3.5 bg-muted/20"
                    >
                      {/* Product Selector */}
                      <div className="flex items-start justify-between gap-3">
                        <Field className="flex-1">
                          <FieldLabel className="text-xs">Select Equipment</FieldLabel>
                          <Select
                            value={item.product_id}
                            onValueChange={(val) => updateItem(index, "product_id", val)}
                          >
                            <SelectTrigger id={`item-select-${index}`} className="w-full text-xs h-8 bg-card">
                              <SelectValue placeholder="Choose product..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((p) => {
                                const isOutOfStock = p.stock === 0
                                return (
                                  <SelectItem
                                    key={p.id}
                                    value={String(p.id)}
                                    disabled={isOutOfStock}
                                    className="text-xs"
                                  >
                                    {p.name} ({formatCurrency(p.price_per_day)}/day)
                                    {isOutOfStock ? " [Out of Stock]" : ` [Stock: ${p.stock}]`}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </Field>

                        {data.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="size-8 text-muted-foreground hover:text-destructive shrink-0 mt-6 cursor-pointer"
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        )}
                      </div>

                      {/* Quantity, Duration, Subtotal Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <Field>
                          <FieldLabel className="text-xs">
                            Quantity {selectedProduct ? `(max ${selectedProduct.stock})` : ""}
                          </FieldLabel>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min={1}
                            max={selectedProduct?.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", parseInt(e.target.value) || 1)
                            }
                            className="h-8 text-sm"
                          />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">Duration (days)</FieldLabel>
                          <Input
                            id={`duration-${index}`}
                            type="number"
                            min={1}
                            value={item.duration_days}
                            onChange={(e) =>
                              updateItem(index, "duration_days", parseInt(e.target.value) || 1)
                            }
                            className="h-8 text-sm"
                          />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">Subtotal</FieldLabel>
                          <div className="flex h-8 items-center rounded-md border border-input bg-muted/50 px-3 text-xs font-medium text-muted-foreground">
                            {itemSubtotal > 0 ? formatCurrency(itemSubtotal) : "—"}
                          </div>
                        </Field>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Validation error for items */}
              {errors.items && (
                <p className="text-xs text-destructive">{errors.items}</p>
              )}
            </div>

            <Separator />

            {/* Total Preview */}
            {totalPreview > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(totalPreview)}
                </span>
              </div>
            )}

            {/* Notes */}
            <Field>
              <FieldLabel>Notes (optional)</FieldLabel>
              <Textarea
                id="rental-notes"
                placeholder="Any additional notes for this transaction..."
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                rows={2}
              />
              {errors.notes && <FieldError>{errors.notes}</FieldError>}
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-rental-form"
            disabled={processing}
            className="cursor-pointer"
          >
            {processing ? "Creating..." : "Create Rental"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
