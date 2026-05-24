import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ShieldCheckIcon, UserIcon } from "lucide-react"
import { PERMISSION_GROUPS, PERMISSION_META } from "@/types/account"

interface RolePermissionPickerProps {
  role: string
  permissions: string[]
  kasirPermissions?: string[]
  onChangeRole: (role: string) => void
  onTogglePermission: (permission: string) => void
  onSelectAllPermissions: () => void
  onClearAllPermissions: () => void
  error?: string
}

export function RolePermissionPicker({
  role,
  permissions,
  kasirPermissions = [],
  onChangeRole,
  onTogglePermission,
  onSelectAllPermissions,
  onClearAllPermissions,
  error,
}: RolePermissionPickerProps) {
  const isKasir = role === "kasir"

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheckIcon className="size-4 text-violet-500" />
        <span className="text-sm font-semibold">Role & Akses</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Owner card */}
        <button
          type="button"
          onClick={() => onChangeRole("owner")}
          className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
            role === "owner"
              ? "border-violet-500 bg-violet-500/5"
              : "border-border hover:border-violet-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-violet-500" />
              <span className="text-sm font-semibold">Owner</span>
            </div>
            {role === "owner" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-violet-500/10 text-violet-600">
                Aktif
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Akses penuh — produk, akun, pelanggan, transaksi, dan laporan.
          </p>
        </button>

        {/* Kasir card */}
        <button
          type="button"
          onClick={() => onChangeRole("kasir")}
          className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
            role === "kasir"
              ? "border-blue-500 bg-blue-500/5"
              : "border-border hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-blue-500" />
              <span className="text-sm font-semibold">Kasir</span>
            </div>
            {role === "kasir" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-blue-500/10 text-blue-600">
                Aktif
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Akses operasional — pelanggan & transaksi sewa sesuai izin yang diberikan.
          </p>
        </button>
      </div>

      {/* Kasir permissions checkboxes */}
      {isKasir && kasirPermissions.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Izin Akses Kasir
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSelectAllPermissions}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                Pilih semua
              </button>
              <span className="text-muted-foreground text-[11px]">/</span>
              <button
                type="button"
                onClick={onClearAllPermissions}
                className="text-[11px] text-muted-foreground hover:text-destructive hover:underline cursor-pointer"
              >
                Hapus semua
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
            {PERMISSION_GROUPS.map((group) => {
              const groupPerms = kasirPermissions.filter(
                (p) => PERMISSION_META[p]?.group === group
              )
              if (groupPerms.length === 0) return null
              return (
                <div key={group} className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">{group}</p>
                  {groupPerms.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        id={`perm-${perm}`}
                        checked={permissions.includes(perm)}
                        onCheckedChange={() => onTogglePermission(perm)}
                        className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <span className="text-xs text-foreground group-hover:text-blue-600 transition-colors">
                        {PERMISSION_META[perm]?.label ?? perm}
                      </span>
                    </label>
                  ))}
                </div>
              )
            })}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}
