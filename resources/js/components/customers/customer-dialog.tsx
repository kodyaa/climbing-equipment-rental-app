import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Customer } from "@/types/customer"
import { useCustomerForm } from "@/hooks/use-customer-form"
import { useRegion } from "@/hooks/use-region"
import { CustomerForm } from "./customer-form"

interface CustomerDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingCustomer: Customer | null
}

export function CustomerDialog({ isOpen, onOpenChange, editingCustomer }: CustomerDialogProps) {
  const dialogContentRef = React.useRef<HTMLDivElement | null>(null)

  const {
    provinces,
    regencies,
    districts,
    villages,
    selectedProv,
    selectedReg,
    selectedDist,
    selectedVill,
    handleProvChange,
    handleRegChange,
    handleDistChange,
    handleVillChange,
    resetRegion,
  } = useRegion({
    isOpen,
    initialWilayahKode: editingCustomer?.wilayah_kode,
    onWilayahKodeChange: (kode) => setData("wilayah_kode", kode),
  })

  const {
    data,
    setData,
    errors,
    processing,
    idNumberError,
    handleSubmit,
    handleCancel,
  } = useCustomerForm({
    editingCustomer,
    onOpenChange,
    resetRegion: () => resetRegion(),
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleCancel()
      }
    }}>
      <DialogContent ref={dialogContentRef} className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            {editingCustomer
              ? "Update the details and region details for the selected customer."
              : "Register a new customer for renting equipment."}
          </DialogDescription>
        </DialogHeader>

        <CustomerForm
          editingCustomer={editingCustomer}
          dialogContentRef={dialogContentRef}
          data={data}
          setData={setData}
          errors={errors}
          processing={processing}
          idNumberError={idNumberError}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          regionData={{
            provinces,
            regencies,
            districts,
            villages,
            selectedProv,
            selectedReg,
            selectedDist,
            selectedVill,
            handleProvChange,
            handleRegChange,
            handleDistChange,
            handleVillChange,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
