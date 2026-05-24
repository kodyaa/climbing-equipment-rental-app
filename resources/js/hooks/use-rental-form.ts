import { useForm } from "@inertiajs/react"
import { useEffect } from "react"
import { toast } from "sonner"
import { Product } from "@/types/product"

export interface RentalFormItem {
  product_id: string
  quantity: number
  duration_days: number
}

interface UseRentalFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  availableProducts: Product[]
}

export function useRentalForm({ isOpen, onOpenChange, availableProducts }: UseRentalFormProps) {
  const today = new Date().toISOString().split("T")[0]

  const { data, setData, post, errors, processing, reset } = useForm<{
    customer_id: string
    rental_date: string
    expected_return_date: string
    notes: string
    items: RentalFormItem[]
  }>({
    customer_id: "",
    rental_date: today,
    expected_return_date: "",
    notes: "",
    items: [{ product_id: "", quantity: 1, duration_days: 1 }],
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen])

  const addItem = () => {
    setData("items", [...data.items, { product_id: "", quantity: 1, duration_days: 1 }])
  }

  const removeItem = (index: number) => {
    setData("items", data.items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof RentalFormItem, value: string | number) => {
    const updated = data.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setData("items", updated)
  }

  // Calculate total preview price
  const totalPreview = data.items.reduce((sum, item) => {
    const product = availableProducts.find((p) => p.id === Number(item.product_id))
    if (!product) return sum
    return sum + Number(product.price_per_day) * item.quantity * item.duration_days
  }, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post("/rentals", {
      onSuccess: () => {
        onOpenChange(false)
      },
      onError: () => {
        toast.error("Failed to create rental. Please check your inputs.")
      },
    })
  }

  return {
    data,
    setData,
    errors,
    processing,
    addItem,
    removeItem,
    updateItem,
    totalPreview,
    handleSubmit,
  }
}
