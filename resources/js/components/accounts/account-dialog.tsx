import * as React from "react"
import { useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { AvatarConfig } from "./avatar"

interface Account {
  id: number
  name: string
  email: string
  phone: string
  country: string
  address: string
  avatar: string | null
}

interface AccountDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingUser: Account | null
}

export function AccountDialog({ isOpen, onOpenChange, editingUser }: AccountDialogProps) {
  // Local state for avatar preview
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  // Local state for avatar mode: file upload or generated Micah svg URL
  const [avatarMode, setAvatarMode] = React.useState<"upload" | "micah">("upload")
  // Local state for avatar seed index to choose different variants
  const [avatarSeedIndex, setAvatarSeedIndex] = React.useState<number>(0)
  // Local state for mouth shape selection
  const [avatarMouth, setAvatarMouth] = React.useState<string>("default")
  // Local state for shirt color selection
  const [avatarShirtColor, setAvatarShirtColor] = React.useState<string>("default")
  // Local state for avatar background color
  const [avatarBgColor, setAvatarBgColor] = React.useState<string>("default")

  // Form state using Inertia useForm
  const { data, setData, post, errors, processing, reset } = useForm({
    name: "",
    email: "",
    phone: "",
    country: "us",
    address: "",
    avatar: null as File | string | null,
    password: "",
  })

  // Sync form data when dialog opens or editingUser changes
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
        })
        setAvatarPreview(editingUser.avatar)
        if (editingUser.avatar && editingUser.avatar.includes("micah")) {
          setAvatarMode("micah")
          try {
            const urlObj = new URL(editingUser.avatar)
            const seedParam = urlObj.searchParams.get("seed") || ""
            const match = seedParam.match(/-(\d+)$/)
            if (match) {
              setAvatarSeedIndex(parseInt(match[1], 10))
            } else {
              setAvatarSeedIndex(0)
            }
            const mouthParam = urlObj.searchParams.get("mouth") || "default"
            setAvatarMouth(mouthParam)
            const shirtColorParam = urlObj.searchParams.get("shirtColor") || "default"
            setAvatarShirtColor(shirtColorParam)
            const bgParam = urlObj.searchParams.get("backgroundColor") || "default"
            const primaryBg = bgParam.split(",")[0]
            setAvatarBgColor(primaryBg)
          } catch (e) {
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

  // Handle Form Submit (actual backend requests)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      // Edit Action
      post(`/accounts/${editingUser.id}`, {
        onSuccess: () => {
          toast.success("Account updated successfully!")
          onOpenChange(false)
        },
        onError: () => {
          toast.error("Failed to update account. Please check inputs.")
        }
      })
    } else {
      // Create Action
      post("/accounts", {
        onSuccess: () => {
          toast.success("Account created successfully!")
          onOpenChange(false)
        },
        onError: () => {
          toast.error("Failed to create account. Please check inputs.")
        }
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleCancel()
      }
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit Account" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {editingUser 
              ? "Make changes to your cashier or administrator profile details below." 
              : "Fill in the credentials and profile details to register a new cashier."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col md:flex-row gap-6 py-2 pb-4">
            {/* Left Side: Profile Image Upload / Avatar Selection */}
            <AvatarConfig
              isOpen={isOpen}
              editingUser={editingUser}
              data={data}
              setData={setData}
              errors={errors}
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
              avatarMode={avatarMode}
              setAvatarMode={setAvatarMode}
              avatarSeedIndex={avatarSeedIndex}
              setAvatarSeedIndex={setAvatarSeedIndex}
              avatarMouth={avatarMouth}
              setAvatarMouth={setAvatarMouth}
              avatarShirtColor={avatarShirtColor}
              setAvatarShirtColor={setAvatarShirtColor}
              avatarBgColor={avatarBgColor}
              setAvatarBgColor={setAvatarBgColor}
            />

            {/* Right Side: Account details form fields */}
            <div className="flex-1">
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-name">Name</FieldLabel>
                    <Input
                      id="form-name"
                      type="text"
                      placeholder="Evil Rabbit"
                      required
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-email">Email</FieldLabel>
                    <Input
                      id="form-email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                    />
                    <FieldError>{errors.email}</FieldError>
                    <FieldDescription>
                      We'll never share your email with anyone.
                    </FieldDescription>
                  </Field>

                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
                    <Input
                      id="form-phone"
                      type="tel"
                      placeholder="+62 812-3456"
                      required
                      value={data.phone}
                      onChange={(e) => setData("phone", e.target.value)}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </Field>

                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="form-country">Country</FieldLabel>
                    <Select
                      value={data.country}
                      onValueChange={(val) => setData("country", val)}
                    >
                      <SelectTrigger id="form-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="id">Indonesia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.country}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-address">Address</FieldLabel>
                    <Input
                      id="form-address"
                      type="text"
                      placeholder="123 Main St"
                      required
                      value={data.address}
                      onChange={(e) => setData("address", e.target.value)}
                    />
                    <FieldError>{errors.address}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-password">Password</FieldLabel>
                    <Input
                      id="form-password"
                      type="password"
                      placeholder={editingUser ? "•••••••• (Leave blank to keep current)" : "••••••••"}
                      required={!editingUser}
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>
                </div>
              </FieldGroup>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {editingUser ? "Save Changes" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
