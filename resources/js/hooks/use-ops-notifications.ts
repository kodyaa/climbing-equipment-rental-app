import * as React from "react"
import { useEchoPublic } from "@laravel/echo-react"
import { toast } from "sonner"

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType = "stock_low" | "rental_status" | "rental_overdue"

export interface OpsNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  /** Raw event payload for deep linking or extra context */
  payload?: Record<string, unknown>
}

// ─── Echo event shapes ────────────────────────────────────────────────────────

interface StockLowPayload {
  product: { id: number; name: string; category: string; stock: number }
}

interface RentalStatusPayload {
  rental_code: string
  customer_name: string
  action: "created" | "returned" | "cancelled"
  status: string
}

interface OverduePayload {
  overdue_count: number
  rentals: { rental_code: string; customer_name: string; expected_return_date: string; days_overdue: number }[]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOpsNotifications() {
  const [notifications, setNotifications] = React.useState<OpsNotification[]>([])

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  )

  const addNotification = React.useCallback((notification: Omit<OpsNotification, "id" | "timestamp" | "isRead">) => {
    const newNotif: OpsNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      isRead: false,
    }
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]) // keep max 50
    return newNotif
  }, [])

  const markAllRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  // ── 🔔 Stock Low Alert ──────────────────────────────────────────────────────
  useEchoPublic<StockLowPayload>("ops", ".stock.low", (e) => {
    const { product } = e
    const stokLabel = product.stock === 0 ? "Stok HABIS!" : `Sisa stok: ${product.stock}`
    const notif = addNotification({
      type: "stock_low",
      title: "⚠️ Stok Hampir Habis",
      message: `${product.name} (${product.category}) — ${stokLabel}`,
      payload: e as unknown as Record<string, unknown>,
    })

    toast.warning(notif.title, {
      description: notif.message,
      duration: 6000,
    })
  })

  // ── 📦 Rental Status Changed ────────────────────────────────────────────────
  useEchoPublic<RentalStatusPayload>("ops", ".rental.status", (e) => {
    const actionLabel = {
      created: "dibuat",
      returned: "dikembalikan",
      cancelled: "dibatalkan",
    }[e.action] ?? e.action

    const notif = addNotification({
      type: "rental_status",
      title: "📦 Sewa " + actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1),
      message: `${e.rental_code} — ${e.customer_name} (${actionLabel})`,
      payload: e as unknown as Record<string, unknown>,
    })

    toast.info(notif.title, {
      description: notif.message,
      duration: 5000,
    })
  })

  // ── ⚠️ Overdue Rental Alert ─────────────────────────────────────────────────
  useEchoPublic<OverduePayload>("ops", ".rental.overdue", (e) => {
    const preview = e.rentals
      .slice(0, 3)
      .map((r) => `${r.rental_code} (${r.days_overdue} hari)`)
      .join(", ")

    const notif = addNotification({
      type: "rental_overdue",
      title: `⏰ ${e.overdue_count} Sewa Terlambat`,
      message: preview + (e.rentals.length > 3 ? ` +${e.rentals.length - 3} lainnya` : ""),
      payload: e as unknown as Record<string, unknown>,
    })

    toast.error(notif.title, {
      description: notif.message,
      duration: 8000,
    })
  })

  return { notifications, unreadCount, markAllRead, clearAll }
}
