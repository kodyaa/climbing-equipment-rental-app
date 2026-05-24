import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  UserIcon,
  CalendarIcon,
  TrashIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
} from "lucide-react"

import { Customer } from "@/types/customer"
import { formatCurrency, formatDate, formatNumber, parseNumber } from "@/lib/format"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { parseDate, getLocalTimeZone, CalendarDate } from "@internationalized/date"

// Local date helpers using @internationalized/date to parse/format YYYY-MM-DD cleanly without timezone shifts
const parseLocalDate = (dateStr: string | null | undefined): Date | undefined => {
  if (!dateStr) return undefined
  try {
    return parseDate(dateStr).toDate(getLocalTimeZone())
  } catch (e) {
    return undefined
  }
}

const formatLocalDate = (date: Date | undefined): string => {
  if (!date) return ""
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()).toString()
}

export interface CartItem {
  productId: number
  productName: string
  pricePerDay: number
  maxStock: number
  quantity: number
  durationDays: number
}

interface OrderCartProps {
  items: CartItem[]
  customers: Customer[]
  customerId: string
  rentalDate: string
  expectedReturnDate: string
  notes: string
  errors: Record<string, string>
  processing: boolean
  onCustomerChange: (id: string) => void
  onRentalDateChange: (date: string) => void
  onExpectedReturnDateChange: (date: string) => void
  onNotesChange: (notes: string) => void
  onUpdateItem: (productId: number, field: "quantity" | "durationDays", value: number) => void
  onRemoveItem: (productId: number) => void
  onCheckout: () => void
  onAddCustomerClick: () => void
  discount: number
  amountPaid: number
  paymentType: "cash" | "qris"
  onDiscountChange: (val: number) => void
  onAmountPaidChange: (val: number) => void
  onPaymentTypeChange: (val: "cash" | "qris") => void
}

function StepInput({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center border border-input rounded-md h-7 overflow-hidden bg-background">
      <button
        type="button"
        className="px-1.5 h-full text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <MinusIcon className="size-3" />
      </button>
      <span className="w-8 text-center text-xs font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        className="px-1.5 h-full text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
      >
        <PlusIcon className="size-3" />
      </button>
    </div>
  )
}

export function OrderCart({
  items,
  customers,
  customerId,
  rentalDate,
  expectedReturnDate,
  notes,
  errors,
  processing,
  onCustomerChange,
  onRentalDateChange,
  onExpectedReturnDateChange,
  onNotesChange,
  onUpdateItem,
  onRemoveItem,
  onCheckout,
  onAddCustomerClick,
  discount,
  amountPaid,
  paymentType,
  onDiscountChange,
  onAmountPaidChange,
  onPaymentTypeChange,
}: OrderCartProps) {
  const today = new Date().toISOString().split("T")[0]
  const subtotal = items.reduce(
    (sum, item) => sum + item.pricePerDay * item.quantity * item.durationDays,
    0
  )
  const grandTotal = Math.max(0, subtotal - discount)
  const changeReturned = amountPaid - grandTotal

  const canCheckout = items.length > 0 &&
    !!customerId &&
    !!rentalDate &&
    !!expectedReturnDate &&
    !processing &&
    (paymentType === "qris" || amountPaid >= grandTotal)

  const parsedRentalDate = React.useMemo(() => parseLocalDate(rentalDate), [rentalDate])
  const parsedReturnDate = React.useMemo(() => parseLocalDate(expectedReturnDate), [expectedReturnDate])
  const parsedMinRental = React.useMemo(() => parseLocalDate(today), [today])
  const parsedMinReturn = React.useMemo(() => parseLocalDate(rentalDate || today), [rentalDate, today])

  return (
    <div className="flex flex-col h-full border-l bg-card/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b bg-card">
        <ShoppingCartIcon className="size-4 text-primary" />
        <span className="font-semibold text-sm">Order Cart</span>
        {items.length > 0 && (
          <Badge className="ml-auto h-5 px-1.5 text-xs">{items.length}</Badge>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* ── Customer ─────────────────────────── */}
        <div className="px-4 py-3 border-b">
          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
              <UserIcon className="size-3" /> Customer
            </FieldLabel>
            <div className="flex gap-1.5 items-center">
              <Select value={customerId} onValueChange={onCustomerChange}>
                <SelectTrigger
                  id="pos-customer-select"
                  className="h-9 text-xs flex-1"
                >
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground ml-1">— {c.phone}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 cursor-pointer"
                onClick={onAddCustomerClick}
                title="Add new customer"
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {errors.customer_id && (
              <FieldError className="text-xs">{errors.customer_id}</FieldError>
            )}
          </Field>
        </div>

        {/* ── Dates ────────────────────────────── */}
        <div className="px-4 py-3 border-b grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
              <CalendarIcon className="size-3" /> From
            </FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="pos-rental-date-trigger"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8 text-xs bg-background px-2.5",
                    !rentalDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 size-3 text-muted-foreground" />
                  {rentalDate ? formatDate(rentalDate, "short") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedRentalDate}
                  onSelect={(date) => {
                    if (date) {
                      onRentalDateChange(formatLocalDate(date))
                    }
                  }}
                  disabled={(date) => {
                    if (!parsedMinRental) return false
                    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    const t = new Date(parsedMinRental.getFullYear(), parsedMinRental.getMonth(), parsedMinRental.getDate())
                    return d < t
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.rental_date && (
              <FieldError className="text-xs">{errors.rental_date}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
              <CalendarIcon className="size-3" /> Until
            </FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="pos-return-date-trigger"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8 text-xs bg-background px-2.5",
                    !expectedReturnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 size-3 text-muted-foreground" />
                  {expectedReturnDate ? formatDate(expectedReturnDate, "short") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedReturnDate}
                  onSelect={(date) => {
                    if (date) {
                      onExpectedReturnDateChange(formatLocalDate(date))
                    }
                  }}
                  disabled={(date) => {
                    if (!parsedMinReturn) return false
                    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    const t = new Date(parsedMinReturn.getFullYear(), parsedMinReturn.getMonth(), parsedMinReturn.getDate())
                    return d < t
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.expected_return_date && (
              <FieldError className="text-xs">{errors.expected_return_date}</FieldError>
            )}
          </Field>
        </div>

        {/* ── Cart Items ───────────────────────── */}
        <div className="flex-1 px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-3">
              <ShoppingCartIcon className="size-9 opacity-15" strokeWidth={1.5} />
              <div className="text-xs leading-relaxed">
                No items yet.
                <br />
                Click <span className="text-primary font-medium">+</span> on a product to add.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const subtotal = item.pricePerDay * item.quantity * item.durationDays
                return (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-2.5 p-3 rounded-xl bg-muted/50 border border-input"
                  >
                    {/* Product name + remove */}
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-xs font-semibold leading-snug flex-1 line-clamp-2">
                        {item.productName}
                      </span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5 cursor-pointer"
                        onClick={() => onRemoveItem(item.productId)}
                      >
                        <TrashIcon className="size-3.5" />
                      </button>
                    </div>

                    {/* Qty + Days controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Qty
                        </span>
                        <StepInput
                          value={item.quantity}
                          min={1}
                          max={item.maxStock}
                          onChange={(v) => onUpdateItem(item.productId, "quantity", v)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Days
                        </span>
                        <StepInput
                          value={item.durationDays}
                          min={1}
                          onChange={(v) => onUpdateItem(item.productId, "durationDays", v)}
                        />
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatCurrency(item.pricePerDay)}/day × {item.quantity} × {item.durationDays}d
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {errors.items && (
            <p className="text-xs text-destructive mt-2">{errors.items}</p>
          )}
        </div>

        {/* ── Notes ───────────────────────────── */}
        {items.length > 0 && (
          <div className="px-4 pb-3 border-t pt-3">
            <FieldLabel className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Notes (optional)
            </FieldLabel>
            <Textarea
              id="pos-notes"
              placeholder="Special instructions, conditions..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>
        )}

        {/* ── Payment Details ─────────────────── */}
        {items.length > 0 && (
          <div className="px-4 py-3.5 border-t space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Payment Details
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Discount */}
              <Field>
                <FieldLabel className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                  Discount (Rp)
                </FieldLabel>
                <Input
                  type="text"
                  placeholder="0"
                  value={formatNumber(discount)}
                  onChange={(e) => onDiscountChange(parseNumber(e.target.value))}
                  className="h-8 text-xs bg-background"
                />
                {errors.discount && (
                  <FieldError className="text-[10px]">{errors.discount}</FieldError>
                )}
              </Field>

              {/* Payment Type */}
              <Field>
                <FieldLabel className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                  Method
                </FieldLabel>
                <Select value={paymentType} onValueChange={(val) => onPaymentTypeChange(val as "cash" | "qris")}>
                  <SelectTrigger className="h-8 text-xs w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                    <SelectItem value="qris" className="text-xs">QRIS</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_type && (
                  <FieldError className="text-[10px]">{errors.payment_type}</FieldError>
                )}
              </Field>
            </div>

            <div className="flex flex-col gap-3">
              {/* Amount Paid */}
              <Field>
                <FieldLabel className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                  Amount Paid (Rp)
                </FieldLabel>
                <Input
                  type="text"
                  placeholder="0"
                  value={formatNumber(amountPaid)}
                  onChange={(e) => onAmountPaidChange(parseNumber(e.target.value))}
                  disabled={paymentType === "qris"}
                  className="h-8 text-xs bg-background"
                />
                {errors.amount_paid && (
                  <FieldError className="text-[10px]">{errors.amount_paid}</FieldError>
                )}
              </Field>

              {/* Change Return */}
              <Field>
                <FieldLabel className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                  Change Return
                </FieldLabel>
                <div className={cn(
                  "h-8 flex items-center px-2.5 rounded-md border border-input bg-muted/40 text-xs font-semibold tabular-nums",
                  changeReturned < 0 ? "text-destructive font-bold" : "text-foreground/80"
                )}>
                  {changeReturned < 0 ? `-${formatCurrency(Math.abs(changeReturned))}` : formatCurrency(changeReturned)}
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: Total + Checkout ─────────── */}
      <div className="px-4 py-4 border-t bg-card space-y-3 shrink-0">
        {/* Itemized mini summary */}
        {items.length > 0 && (
          <div className="flex flex-col gap-1 text-xs">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-muted-foreground">
                <span className="truncate flex-1 mr-2">{item.productName}</span>
                <span className="tabular-nums shrink-0">
                  {formatCurrency(item.pricePerDay * item.quantity * item.durationDays)}
                </span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {discount > 0 && (
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between items-center text-xs text-destructive">
            <span>Discount</span>
            <span className="tabular-nums">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ReceiptIcon className="size-3.5" />
            <span>Total</span>
          </div>
          <span className="text-xl font-bold text-primary tabular-nums">
            {formatCurrency(grandTotal)}
          </span>
        </div>

        <Button
          id="pos-checkout-btn"
          className="w-full gap-2 cursor-pointer h-10 text-sm font-semibold"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          <CreditCardIcon className="size-4" />
          {processing ? "Processing..." : "Checkout"}
        </Button>

        {!customerId && items.length > 0 && (
          <p className="text-[10px] text-center text-muted-foreground">
            Please select a customer to proceed.
          </p>
        )}
        {(!rentalDate || !expectedReturnDate) && items.length > 0 && customerId && (
          <p className="text-[10px] text-center text-muted-foreground">
            Please set rental and return dates.
          </p>
        )}
        {amountPaid < grandTotal && paymentType === "cash" && items.length > 0 && customerId && (
          <p className="text-[10px] text-center text-destructive font-medium">
            Insufficient payment amount. Remaining: {formatCurrency(grandTotal - amountPaid)}
          </p>
        )}
      </div>
    </div>
  )
}
