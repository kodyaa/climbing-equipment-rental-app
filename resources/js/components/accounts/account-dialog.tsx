import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
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
import { AvatarConfig } from "./avatar"
import { RolePermissionPicker } from "./role-permission-picker"
import { useAccountForm } from "@/hooks/use-account-form"
import { Separator } from "@/components/ui/separator"
import { Account } from "@/types/account"


interface AccountDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingUser: Account | null
  kasirPermissions?: string[]
}

export function AccountDialog({
  isOpen,
  onOpenChange,
  editingUser,
  kasirPermissions = [],
}: AccountDialogProps) {
  const {
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
  } = useAccountForm({
    editingUser,
    isOpen,
    onOpenChange,
    kasirPermissions,
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCancel() }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit Account" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Ubah detail profil dan izin akses akun kasir atau administrator."
              : "Isi data dan atur role serta izin akses untuk akun baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col md:flex-row gap-6 items-stretch py-2 pb-4">
            {/* Left Side: Avatar (Column 1) */}
            <div className="flex-1">
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
            </div>

            <Separator orientation="vertical" className="hidden md:block h-auto" />
            <Separator orientation="horizontal" className="block md:hidden" />

            {/* Middle Side: Form Fields (Column 2) */}
            <div className="flex-1 space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">

                  {/* Name */}
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-name">Nama</FieldLabel>
                    <Input
                      id="form-name"
                      type="text"
                      placeholder="Budi Santoso"
                      required
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </Field>

                  {/* Email */}
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-email">Email</FieldLabel>
                    <Input
                      id="form-email"
                      type="email"
                      placeholder="budi@summitrent.id"
                      required
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </Field>

                  {/* Phone */}
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="form-phone">Telepon</FieldLabel>
                    <Input
                      id="form-phone"
                      type="tel"
                      placeholder="+62 812-3456-7890"
                      required
                      value={data.phone}
                      onChange={(e) => setData("phone", e.target.value)}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </Field>

                  {/* Country */}
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="form-country">Negara</FieldLabel>
                    <Select value={data.country} onValueChange={(val) => setData("country", val)}>
                      <SelectTrigger id="form-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Indonesia</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.country}</FieldError>
                  </Field>

                  {/* Address */}
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-address">Alamat</FieldLabel>
                    <Input
                      id="form-address"
                      type="text"
                      placeholder="Jl. Gunung Agung No. 1, Bali"
                      required
                      value={data.address}
                      onChange={(e) => setData("address", e.target.value)}
                    />
                    <FieldError>{errors.address}</FieldError>
                  </Field>

                  {/* Password */}
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="form-password">Password</FieldLabel>
                    <Input
                      id="form-password"
                      type="password"
                      placeholder={editingUser ? "•••••••• (kosongkan untuk tetap sama)" : "••••••••"}
                      required={!editingUser}
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>

                </div>
              </FieldGroup>
            </div>

            <Separator orientation="vertical" className="hidden md:block h-auto" />
            <Separator orientation="horizontal" className="block md:hidden" />

            {/* Right Side: Role & Access Selection (Column 3) */}
            <div className="flex-1">
              <RolePermissionPicker
                role={data.role}
                permissions={data.permissions}
                kasirPermissions={kasirPermissions}
                onChangeRole={(newRole) => setData("role", newRole)}
                onTogglePermission={togglePermission}
                onSelectAllPermissions={selectAllPermissions}
                onClearAllPermissions={clearAllPermissions}
                error={errors.permissions}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {editingUser ? "Simpan Perubahan" : "Buat Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
