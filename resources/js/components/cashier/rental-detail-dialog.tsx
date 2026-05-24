import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  UserIcon,
  CalendarIcon,
  PackageIcon,
  ReceiptIcon,
  ClockIcon,
  PhoneIcon,
  UserCheck2Icon,
  RotateCcwIcon,
  XCircleIcon,
} from "lucide-react"

import { Rental } from "@/types/rental"
import { formatCurrency, formatDateWithDay } from "@/lib/format"

interface RentalDetailDialogProps {
  rental: Rental | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onReturn: (rental: Rental) => void
  onCancel: (rental: Rental) => void
}

const STATUS_COLOR: Record<string, string> = {
  active: "bg-blue-500/15 text-blue-600 border-blue-500/20 dark:text-blue-400",
  returned: "bg-green-500/15 text-green-600 border-green-500/20 dark:text-green-400",
  overdue: "bg-red-500/15 text-red-600 border-red-500/20 dark:text-red-400",
  cancelled: "bg-muted text-muted-foreground border-input",
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

export function RentalDetailDialog({
  rental,
  isOpen,
  onOpenChange,
  onReturn,
  onCancel,
}: RentalDetailDialogProps) {
  if (!rental) return null

  const isActionable = rental.status === "active" || rental.status === "overdue"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <ReceiptIcon className="size-4 text-primary" />
            Transaction Detail
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono text-primary font-medium">{rental.rental_code}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Status + Dates */}
          <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-input px-4 py-3">
            <Badge
              variant="outline"
              className={`text-xs font-medium capitalize ${STATUS_COLOR[rental.status] ?? ""}`}
            >
              {rental.status}
            </Badge>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(rental.total_price)}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              <UserIcon className="size-3" /> Customer
            </div>
            <InfoRow label="Name" value={rental.customer?.name ?? "—"} />
            <InfoRow
              label="Phone"
              value={
                rental.customer?.phone ? (
                  <span className="flex items-center gap-1">
                    <PhoneIcon className="size-3" />
                    {rental.customer.phone}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow
              label="Processed by"
              value={
                <span className="flex items-center gap-1">
                  <UserCheck2Icon className="size-3" />
                  {rental.cashier?.name ?? "—"}
                </span>
              }
            />
          </div>

          <Separator />

          {/* Rental Dates */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              <CalendarIcon className="size-3" /> Dates
            </div>
            <InfoRow label="Rental Date" value={formatDateWithDay(rental.rental_date)} />
            <InfoRow label="Expected Return" value={formatDateWithDay(rental.expected_return_date)} />
            {rental.returned_at && (
              <InfoRow
                label="Returned At"
                value={
                  <span className="text-green-600 dark:text-green-400">
                    {formatDateWithDay(rental.returned_at)}
                  </span>
                }
              />
            )}
          </div>

          <Separator />

          {/* Items */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              <PackageIcon className="size-3" /> Items ({rental.items.length})
            </div>
            <div className="flex flex-col gap-2">
              {rental.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-muted/40 border border-input px-3 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {item.product?.name ?? `Product #${item.product_id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.quantity}× · {item.duration_days} day{item.duration_days !== 1 ? "s" : ""} ·{" "}
                      {formatCurrency(item.price_per_day)}/day
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {rental.notes && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <ClockIcon className="size-3" /> Notes
                </div>
                <p className="text-sm text-muted-foreground rounded-lg bg-muted/40 border border-input px-3 py-2.5">
                  {rental.notes}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
          {isActionable && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  onCancel(rental)
                  onOpenChange(false)
                }}
                className="cursor-pointer gap-1.5"
              >
                <XCircleIcon className="size-4" /> Cancel Rental
              </Button>
              <Button
                onClick={() => {
                  onReturn(rental)
                  onOpenChange(false)
                }}
                className="cursor-pointer gap-1.5"
              >
                <RotateCcwIcon className="size-4" /> Mark Returned
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
