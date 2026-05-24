export interface Product {
  id: number
  name: string
  category: string
  description: string | null
  price_per_day: number | string
  stock: number
  status: string
  image: string | null
}
