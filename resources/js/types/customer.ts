import { Wilayah } from "./wilayah"

export interface Customer {
  id: number
  name: string
  phone: string
  id_number: string | null
  identity_photo?: string | null
  email: string | null
  wilayah_kode: string | null
  address: string | null
  rentals_count?: number
  wilayah?: Wilayah | null
}
