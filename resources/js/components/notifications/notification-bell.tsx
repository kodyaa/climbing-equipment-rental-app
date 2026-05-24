"use client"

import * as React from "react"
import { BellIcon, PackageIcon, AlertTriangleIcon, ClockIcon, CheckCheckIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useOpsNotifications, type OpsNotification, type NotificationType } from "@/hooks/use-ops-notifications"
import { cn } from "@/lib/utils"

// ─── Icon per notification type ───────────────────────────────────────────────

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "stock_low":
      return <AlertTriangleIcon className="size-4 text-amber-500 shrink-0" />
    case "rental_status":
      return <PackageIcon className="size-4 text-blue-500 shrink-0" />
    case "rental_overdue":
      return <ClockIcon className="size-4 text-red-500 shrink-0" />
  }
}

// ─── Relative time formatter ──────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return "Baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return date.toLocaleDateString("id-ID")
}

// ─── Single Notification Row ──────────────────────────────────────────────────

function NotificationRow({ notification }: { notification: OpsNotification }) {
  return (
    <div
      className={cn(
        "flex gap-3 p-3 border-b border-border/50 last:border-0 transition-colors",
        !notification.isRead && "bg-violet-500/5"
      )}
    >
      <div className="pt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium leading-snug", !notification.isRead && "text-foreground")}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="size-2 rounded-full bg-violet-500 shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{relativeTime(notification.timestamp)}</p>
      </div>
    </div>
  )
}

// ─── Notification Bell ────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = React.useState(false)
  const { notifications, unreadCount, markAllRead, clearAll } = useOpsNotifications()

  const handleOpen = (value: boolean) => {
    setOpen(value)
    if (value && unreadCount > 0) {
      // Short delay so the bell animation is visible before marking read
      setTimeout(markAllRead, 800)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative size-9 border-border/50"
          aria-label="Notifikasi operasional"
        >
          <BellIcon
            className={cn(
              "size-4 transition-transform",
              unreadCount > 0 && "animate-[wiggle_0.5s_ease-in-out]"
            )}
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 size-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-lg"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <BellIcon className="size-4 text-violet-500" />
            <span className="font-semibold text-sm">Notifikasi</span>
            {notifications.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {notifications.length}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                title="Tandai semua sudah dibaca"
                onClick={markAllRead}
              >
                <CheckCheckIcon className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                title="Hapus semua notifikasi"
                onClick={clearAll}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <BellIcon className="size-8 mb-2 opacity-30" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </ScrollArea>
        )}

        {/* Footer hint */}
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <p className="text-[10px] text-muted-foreground">
              Notifikasi hanya tersimpan selama sesi berlangsung
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
