// ─── Account Types ────────────────────────────────────────────────────────────

export interface Account {
  id: number
  name: string
  email: string
  phone: string
  country: string
  address: string
  avatar: string | null
  role?: string
  permissions?: string[]
}

// ─── Permission metadata ──────────────────────────────────────────────────────

export type PermissionGroup = "Produk" | "Pelanggan" | "Sewa"

export interface PermissionMeta {
  label: string
  group: PermissionGroup
}

export const PERMISSION_META: Record<string, PermissionMeta> = {
  "products.view":    { label: "Lihat Produk",          group: "Produk" },
  "customers.view":   { label: "Lihat Pelanggan",        group: "Pelanggan" },
  "customers.create": { label: "Tambah Pelanggan",       group: "Pelanggan" },
  "customers.update": { label: "Edit Pelanggan",         group: "Pelanggan" },
  "customers.delete": { label: "Hapus Pelanggan",        group: "Pelanggan" },
  "rentals.view":     { label: "Lihat Sewa",             group: "Sewa" },
  "rentals.create":   { label: "Buat Transaksi",         group: "Sewa" },
  "rentals.return":   { label: "Proses Pengembalian",    group: "Sewa" },
  "rentals.cancel":   { label: "Batalkan Sewa",          group: "Sewa" },
}

export const PERMISSION_GROUPS: PermissionGroup[] = ["Produk", "Pelanggan", "Sewa"]

// ─── Account form data shape ──────────────────────────────────────────────────

export interface AccountFormData {
  name: string
  email: string
  phone: string
  country: string
  address: string
  avatar: File | string | null
  password: string
  role: string
  permissions: string[]
}
