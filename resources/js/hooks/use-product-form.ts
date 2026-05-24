import * as React from "react"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"
import { Product } from "@/types/product"

interface UseProductFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: Product | null
}

export function useProductForm({ isOpen, onOpenChange, editingProduct }: UseProductFormProps) {
  const [imageMode, setImageMode] = React.useState<"upload" | "url">("upload")
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [imageUrlInput, setImageUrlInput] = React.useState("")

  const { data, setData, post, put, errors, processing, reset } = useForm({
    name: "",
    category: "Tent",
    description: "",
    price_per_day: "" as number | string,
    stock: 0,
    status: "available",
    image: null as File | string | null,
  })

  // Sync editing details on open/change
  React.useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setData({
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description || "",
          price_per_day: editingProduct.price_per_day,
          stock: editingProduct.stock,
          status: editingProduct.status,
          image: null, // Don't override unless user selects new file or updates URL
        })
        setImagePreview(editingProduct.image)
        if (
          editingProduct.image &&
          (editingProduct.image.startsWith("http://") ||
            editingProduct.image.startsWith("https://"))
        ) {
          setImageMode("url")
          setImageUrlInput(editingProduct.image)
        } else {
          setImageMode("upload")
          setImageUrlInput("")
        }
      } else {
        reset()
        setImagePreview(null)
        setImageMode("upload")
        setImageUrlInput("")
      }
    }
  }, [isOpen, editingProduct])

  // Handle image upload selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData("image", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle external image URL pasting
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setImageUrlInput(val)
    setData("image", val)
    setImagePreview(val || null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingProduct) {
      put(`/products/${editingProduct.id}`, {
        onSuccess: () => {
          onOpenChange(false)
        },
        onError: () => {
          toast.error("Failed to update product. Please check inputs.")
        },
      })
    } else {
      post("/products", {
        onSuccess: () => {
          onOpenChange(false)
        },
        onError: () => {
          toast.error("Failed to create product. Please check inputs.")
        },
      })
    }
  }

  const handleCancel = () => {
    reset()
    setImagePreview(null)
    setImageMode("upload")
    setImageUrlInput("")
    onOpenChange(false)
  }

  return {
    data,
    setData,
    errors,
    processing,
    imageMode,
    setImageMode,
    imagePreview,
    setImagePreview,
    imageUrlInput,
    setImageUrlInput,
    handleFileChange,
    handleUrlChange,
    handleSubmit,
    handleCancel,
  }
}
