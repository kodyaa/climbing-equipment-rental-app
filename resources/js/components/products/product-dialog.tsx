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
import { UploadCloudIcon, ImageIcon, PackageIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

import { Product } from "@/types/product"
import { useProductForm } from "@/hooks/use-product-form"

interface ProductDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: Product | null
}

export function ProductDialog({
  isOpen,
  onOpenChange,
  editingProduct,
}: ProductDialogProps) {
  const {
    data,
    setData,
    errors,
    processing,
    imageMode,
    setImageMode,
    imagePreview,
    setImagePreview,
    imageUrlInput,
    handleFileChange,
    handleUrlChange,
    handleSubmit,
    handleCancel,
  } = useProductForm({
    isOpen,
    onOpenChange,
    editingProduct,
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add New Rental Product"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Modify the rental equipment specifications, stock parameters, pricing, and image details."
              : "Register a new piece of climbing or hiking equipment in the rental inventory database."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col md:flex-row gap-6 py-2 pb-4">
            {/* Left Side: Product Image Upload or URL */}
            <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6 gap-4">
              <div className="size-36 rounded-xl overflow-hidden border-2 border-dashed border-input bg-neutral-900 shadow-xs flex items-center justify-center relative group/product transition-all hover:border-primary/50 shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="size-36 object-cover"
                  />
                ) : (
                  <PackageIcon className="size-16 text-neutral-500" />
                )}
              </div>

              {/* Mode switch */}
              <div className="flex flex-col gap-2 w-full px-2">
                <div className="flex rounded-lg border border-input p-0.5 bg-muted text-muted-foreground text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("upload")
                      setData("image", null)
                      setImagePreview(
                        editingProduct &&
                          editingProduct.image &&
                          !editingProduct.image.startsWith("http")
                          ? editingProduct.image
                          : null
                      )
                    }}
                    className={`flex-1 py-1 rounded-md font-medium text-center transition-all cursor-pointer ${
                      imageMode === "upload"
                        ? "bg-background text-foreground shadow-xs"
                        : "hover:text-foreground"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("url")
                      setData("image", imageUrlInput)
                      setImagePreview(imageUrlInput || null)
                    }}
                    className={`flex-1 py-1 rounded-md font-medium text-center transition-all cursor-pointer ${
                      imageMode === "url"
                        ? "bg-background text-foreground shadow-xs"
                        : "hover:text-foreground"
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              <div className="text-center w-full px-2">
                {imageMode === "upload" ? (
                  <>
                    <label
                      htmlFor="product-image-upload"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-input rounded-md text-xs font-semibold text-foreground bg-background hover:bg-accent cursor-pointer transition-colors shadow-xs"
                    >
                      <UploadCloudIcon className="size-3.5 text-muted-foreground" />
                      Choose Photo
                    </label>
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">
                      PNG, JPG up to 2MB
                    </p>
                  </>
                ) : (
                  <div className="w-full flex flex-col gap-1 text-left">
                    <FieldLabel
                      htmlFor="image-url-field"
                      className="text-[10px]"
                    >
                      Image URL link
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="image-url-field"
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrlInput}
                        onChange={handleUrlChange}
                        className="text-xs pr-8"
                      />
                      <ImageIcon className="absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <FieldError className="mt-1">{errors.image}</FieldError>
              </div>
            </div>

            {/* Right Side: Product Details */}
            <div className="flex-1">
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="prod-name">Product Name</FieldLabel>
                    <Input
                      id="prod-name"
                      type="text"
                      placeholder="e.g. Consina Magnum 4 Tent"
                      required
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </Field>

                  {/* Category */}
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="prod-category">Category</FieldLabel>
                    <Select
                      value={data.category}
                      onValueChange={(val) => setData("category", val)}
                    >
                      <SelectTrigger id="prod-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tent">Tent</SelectItem>
                        <SelectItem value="Backpack">Backpack</SelectItem>
                        <SelectItem value="Sleeping Bag">
                          Sleeping Bag
                        </SelectItem>
                        <SelectItem value="Footwear">Footwear</SelectItem>
                        <SelectItem value="Cooking Gear">
                          Cooking Gear
                        </SelectItem>
                        <SelectItem value="Climbing Gear">
                          Climbing Gear
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.category}</FieldError>
                  </Field>

                  {/* Status */}
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="prod-status">Status</FieldLabel>
                    <Select
                      value={data.status}
                      onValueChange={(val) => setData("status", val)}
                    >
                      <SelectTrigger id="prod-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out_of_stock">
                          Out Of Stock
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.status}</FieldError>
                  </Field>

                  {/* Price Per Day */}
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="prod-price">Daily Price (Rp)</FieldLabel>
                    <Input
                      id="prod-price"
                      type="number"
                      min="0"
                      placeholder="45000"
                      required
                      value={data.price_per_day}
                      onChange={(e) => setData("price_per_day", e.target.value)}
                    />
                    <FieldError>{errors.price_per_day}</FieldError>
                  </Field>

                  {/* Stock */}
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor="prod-stock">Stock Count</FieldLabel>
                    <Input
                      id="prod-stock"
                      type="number"
                      min="0"
                      placeholder="5"
                      required
                      value={data.stock}
                      onChange={(e) => setData("stock", parseInt(e.target.value, 10) || 0)}
                    />
                    <FieldError>{errors.stock}</FieldError>
                  </Field>

                  {/* Description */}
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="prod-desc">Description</FieldLabel>
                    <Textarea
                      id="prod-desc"
                      rows={3}
                      placeholder="Enter details, capacity, and size features..."
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                    />
                    <FieldError>{errors.description}</FieldError>
                  </Field>
                </div>
              </FieldGroup>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
