import * as React from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import { Customer } from "@/types/customer"
import { Wilayah } from "@/types/wilayah"
import { CustomerImageUpload } from "./customer-image-upload"
import { CustomerRegionFields } from "./customer-region-fields"

interface CustomerFormProps {
  editingCustomer: Customer | null
  dialogContentRef: React.RefObject<HTMLDivElement | null>
  data: {
    name: string
    phone: string
    id_number: string
    identity_photo: File | string | null
    email: string
    wilayah_kode: string
    address: string
  }
  setData: (key: any, value: any) => void
  errors: Record<string, string>
  processing: boolean
  idNumberError: string
  handleSubmit: (e: React.FormEvent) => void
  handleCancel: () => void
  regionData: {
    provinces: Wilayah[]
    regencies: Wilayah[]
    districts: Wilayah[]
    villages: Wilayah[]
    selectedProv: { value: string; label: string } | null
    selectedReg: { value: string; label: string } | null
    selectedDist: { value: string; label: string } | null
    selectedVill: { value: string; label: string } | null
    handleProvChange: (prov: { value: string; label: string } | null) => void
    handleRegChange: (reg: { value: string; label: string } | null) => void
    handleDistChange: (dist: { value: string; label: string } | null) => void
    handleVillChange: (vill: { value: string; label: string } | null) => void
  }
}

export function CustomerForm({
  editingCustomer,
  dialogContentRef,
  data,
  setData,
  errors,
  processing,
  idNumberError,
  handleSubmit,
  handleCancel,
  regionData,
}: CustomerFormProps) {
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <FieldGroup className="py-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grid 1: Basic Information */}
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="cust-name">Full Name</FieldLabel>
              <Input
                id="cust-name"
                type="text"
                placeholder="e.g. Budi Santoso"
                required
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field className="col-span-2 sm:col-span-1">
                <FieldLabel htmlFor="cust-phone">Phone Number</FieldLabel>
                <Input
                  id="cust-phone"
                  type="tel"
                  placeholder="e.g. 081234567890"
                  required
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                />
                <FieldError>{errors.phone}</FieldError>
              </Field>

              <Field className="col-span-2 sm:col-span-1" data-invalid={!!idNumberError}>
                <FieldLabel htmlFor="cust-id-number">KTP / Passport ID</FieldLabel>
                <Input
                  id="cust-id-number"
                  type="text"
                  placeholder="16-digit ID number"
                  aria-invalid={!!idNumberError}
                  value={data.id_number}
                  onChange={(e) => setData("id_number", e.target.value)}
                />
                <FieldError>{idNumberError || errors.id_number}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="cust-email">Email Address</FieldLabel>
              <Input
                id="cust-email"
                type="email"
                placeholder="e.g. budi@example.com"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="cust-identity-photo">Identity Card Photo (KTP / SIM / Passport)</FieldLabel>
              <CustomerImageUpload
                value={data.identity_photo}
                onChange={(file) => setData("identity_photo", file)}
              />
              <FieldError>{errors.identity_photo}</FieldError>
            </Field>
          </div>

          {/* Grid 2: Region & Address Information */}
          <div>
            <CustomerRegionFields
              provinces={regionData.provinces}
              regencies={regionData.regencies}
              districts={regionData.districts}
              villages={regionData.villages}
              selectedProv={regionData.selectedProv}
              selectedReg={regionData.selectedReg}
              selectedDist={regionData.selectedDist}
              selectedVill={regionData.selectedVill}
              handleProvChange={regionData.handleProvChange}
              handleRegChange={regionData.handleRegChange}
              handleDistChange={regionData.handleDistChange}
              handleVillChange={regionData.handleVillChange}
              dialogContentRef={dialogContentRef}
              address={data.address}
              onAddressChange={(val) => setData("address", val)}
              addressError={errors.address}
            />
          </div>
        </div>
      </FieldGroup>

      <DialogFooter className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
          Cancel
        </Button>
        <Button type="submit" disabled={processing}>
          {editingCustomer ? "Save Changes" : "Register Customer"}
        </Button>
      </DialogFooter>
    </form>
  )
}
