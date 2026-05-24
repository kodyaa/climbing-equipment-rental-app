import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Wilayah } from "@/types/wilayah"

interface CustomerRegionFieldsProps {
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
  dialogContentRef: React.RefObject<HTMLDivElement | null>
  address: string
  onAddressChange: (val: string) => void
  addressError?: string
}

export function CustomerRegionFields({
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
  dialogContentRef,
  address,
  onAddressChange,
  addressError,
}: CustomerRegionFieldsProps) {
  return (
    <div className="flex flex-col gap-4 border p-4 rounded-xl bg-muted/15 h-full">
      <div className="grid grid-cols-2 gap-3.5">
        <span className="col-span-2 text-xs font-semibold text-foreground/80">
          Region (Wilayah)
        </span>

        {/* Province Select */}
        <Field className="col-span-2 sm:col-span-1">
          <FieldLabel htmlFor="cust-prov">Province</FieldLabel>
          <Combobox
            items={provinces.map((p) => ({ value: p.kode, label: p.nama }))}
            value={selectedProv}
            onValueChange={handleProvChange}
          >
            <ComboboxTrigger render={
              <Button variant="outline" className="w-full justify-between font-normal h-9 text-xs bg-card">
                <ComboboxValue placeholder="Select Province" />
              </Button>
            } />
            <ComboboxContent container={dialogContentRef} className="w-full">
              <ComboboxInput showTrigger={false} placeholder="Search province..." className="w-full text-xs" />
              <ComboboxEmpty className="text-xs">No province found.</ComboboxEmpty>
              <ComboboxList>
                {(item: { value: string; label: string }) => (
                  <ComboboxItem key={item.value} value={item} className="text-xs">
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        {/* Regency Select */}
        <Field className="col-span-2 sm:col-span-1">
          <FieldLabel htmlFor="cust-reg">Regency / City</FieldLabel>
          <Combobox
            items={regencies.map((r) => ({ value: r.kode, label: r.nama }))}
            value={selectedReg}
            onValueChange={handleRegChange}
            disabled={!selectedProv || regencies.length === 0}
          >
            <ComboboxTrigger render={
              <Button variant="outline" className="w-full justify-between font-normal h-9 text-xs bg-card" disabled={!selectedProv || regencies.length === 0}>
                <ComboboxValue placeholder="Select Regency/City" />
              </Button>
            } />
            <ComboboxContent container={dialogContentRef} className="w-full">
              <ComboboxInput showTrigger={false} placeholder="Search regency/city..." className="w-full text-xs" />
              <ComboboxEmpty className="text-xs">No regency found.</ComboboxEmpty>
              <ComboboxList>
                {(item: { value: string; label: string }) => (
                  <ComboboxItem key={item.value} value={item} className="text-xs">
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        {/* District Select */}
        <Field className="col-span-2 sm:col-span-1">
          <FieldLabel htmlFor="cust-dist">District (Kecamatan)</FieldLabel>
          <Combobox
            items={districts.map((d) => ({ value: d.kode, label: d.nama }))}
            value={selectedDist}
            onValueChange={handleDistChange}
            disabled={!selectedReg || districts.length === 0}
          >
            <ComboboxTrigger render={
              <Button variant="outline" className="w-full justify-between font-normal h-9 text-xs bg-card" disabled={!selectedReg || districts.length === 0}>
                <ComboboxValue placeholder="Select District" />
              </Button>
            } />
            <ComboboxContent container={dialogContentRef} className="w-full">
              <ComboboxInput showTrigger={false} placeholder="Search district..." className="w-full text-xs" />
              <ComboboxEmpty className="text-xs">No district found.</ComboboxEmpty>
              <ComboboxList>
                {(item: { value: string; label: string }) => (
                  <ComboboxItem key={item.value} value={item} className="text-xs">
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        {/* Village Select */}
        <Field className="col-span-2 sm:col-span-1">
          <FieldLabel htmlFor="cust-vill">Village (Desa/Kelurahan)</FieldLabel>
          <Combobox
            items={villages.map((v) => ({ value: v.kode, label: v.nama }))}
            value={selectedVill}
            onValueChange={handleVillChange}
            disabled={!selectedDist || villages.length === 0}
          >
            <ComboboxTrigger render={
              <Button variant="outline" className="w-full justify-between font-normal h-9 text-xs bg-card" disabled={!selectedDist || villages.length === 0}>
                <ComboboxValue placeholder="Select Village" />
              </Button>
            } />
            <ComboboxContent container={dialogContentRef} className="w-full">
              <ComboboxInput showTrigger={false} placeholder="Search village..." className="w-full text-xs" />
              <ComboboxEmpty className="text-xs">No village found.</ComboboxEmpty>
              <ComboboxList>
                {(item: { value: string; label: string }) => (
                  <ComboboxItem key={item.value} value={item} className="text-xs">
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
      </div>

      <Field className="w-full mt-2.5">
        <FieldLabel htmlFor="cust-address">Street Address</FieldLabel>
        <Textarea
          id="cust-address"
          placeholder="Detailed street name, housing number..."
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          rows={3}
          className="text-xs bg-card"
        />
        <FieldError>{addressError}</FieldError>
      </Field>
    </div>
  )
}
