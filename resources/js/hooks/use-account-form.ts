import * as React from "react"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"
import { Account, AccountFormData } from "@/types/account"

interface UseAccountFormProps {
  editingUser: Account | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  kasirPermissions?: string[]
}

export function useAccountForm({
  editingUser,
  isOpen,
  onOpenChange,
  kasirPermissions = [],
}: UseAccountFormProps) {
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [avatarMode, setAvatarMode] = React.useState<"upload" | "micah">("upload")
  const [avatarSeedIndex, setAvatarSeedIndex] = React.useState<number>(0)
  const [avatarMouth, setAvatarMouth] = React.useState<string>("default")
  const [avatarShirtColor, setAvatarShirtColor] = React.useState<string>("default")
  const [avatarBgColor, setAvatarBgColor] = React.useState<string>("default")

  const { data, setData, post, put, errors, processing, reset } = useForm<AccountFormData>({
    name: "",
    email: "",
    phone: "",
    country: "id",
    address: "",
    avatar: null,
    password: "",
    role: "kasir",
    permissions: [],
  })

  // Synchronize form when dialog opens or editingUser changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setData({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          country: editingUser.country,
          address: editingUser.address,
          avatar: null,
          password: "",
          role: editingUser.role ?? "kasir",
          permissions: editingUser.permissions ?? [],
        })
        setAvatarPreview(editingUser.avatar)
        if (editingUser.avatar && editingUser.avatar.includes("micah")) {
          setAvatarMode("micah")
          try {
            const urlObj = new URL(editingUser.avatar)
            const seedParam = urlObj.searchParams.get("seed") || ""
            const match = seedParam.match(/-(\d+)$/)
            setAvatarSeedIndex(match ? parseInt(match[1], 10) : 0)
            setAvatarMouth(urlObj.searchParams.get("mouth") || "default")
            setAvatarShirtColor(urlObj.searchParams.get("shirtColor") || "default")
            const bgParam = urlObj.searchParams.get("backgroundColor") || "default"
            setAvatarBgColor(bgParam.split(",")[0])
          } catch {
            setAvatarSeedIndex(0)
            setAvatarMouth("default")
            setAvatarShirtColor("default")
            setAvatarBgColor("default")
          }
        } else {
          setAvatarMode("upload")
          setAvatarSeedIndex(0)
          setAvatarMouth("default")
          setAvatarShirtColor("default")
          setAvatarBgColor("default")
        }
      } else {
        reset()
        setAvatarPreview(null)
        setAvatarMode("upload")
        setAvatarSeedIndex(0)
        setAvatarMouth("default")
        setAvatarShirtColor("default")
        setAvatarBgColor("default")
      }
    }
  }, [isOpen, editingUser])

  const togglePermission = (perm: string) => {
    setData("permissions",
      data.permissions.includes(perm)
        ? data.permissions.filter((p) => p !== perm)
        : [...data.permissions, perm]
    )
  }

  const selectAllPermissions = () => setData("permissions", [...kasirPermissions])
  const clearAllPermissions = () => setData("permissions", [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      put(`/accounts/${editingUser.id}`, {
        onSuccess: () => onOpenChange(false),
        onError: () => toast.error("Failed to update account. Please check inputs."),
      })
    } else {
      post("/accounts", {
        onSuccess: () => onOpenChange(false),
        onError: () => toast.error("Failed to create account. Please check inputs."),
      })
    }
  }

  const handleCancel = () => {
    reset()
    setAvatarPreview(null)
    setAvatarMode("upload")
    setAvatarSeedIndex(0)
    setAvatarMouth("default")
    setAvatarShirtColor("default")
    setAvatarBgColor("default")
    onOpenChange(false)
  }

  return {
    data,
    setData,
    errors,
    processing,
    avatarPreview,
    setAvatarPreview,
    avatarMode,
    setAvatarMode,
    avatarSeedIndex,
    setAvatarSeedIndex,
    avatarMouth,
    setAvatarMouth,
    avatarShirtColor,
    setAvatarShirtColor,
    avatarBgColor,
    setAvatarBgColor,
    togglePermission,
    selectAllPermissions,
    clearAllPermissions,
    handleSubmit,
    handleCancel,
  }
}
