import { Customer } from "./customer"

export interface RentalItem {
  id: number
  product_id: number
  quantity: number
  duration_days: number
  price_per_day: number | string
  subtotal: number | string
  product: {
    id: number
    name: string
  } | null
}

export interface Rental {
  id: number
  rental_code: string
  rental_date: string
  expected_return_date: string
  returned_at: string | null
  total_price: number | string
  status: "active" | "returned" | "overdue" | "cancelled"
  notes: string | null
  customer: Customer | null
  cashier: {
    id: number
    name: string
  } | null
  items: RentalItem[]
}
