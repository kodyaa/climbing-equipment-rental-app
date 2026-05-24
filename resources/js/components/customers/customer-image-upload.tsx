import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Trash2, UploadCloud } from "lucide-react"

interface CustomerImageUploadProps {
  value: File | string | null
  onChange: (file: File | null) => void
}

export function CustomerImageUpload({ value, onChange }: CustomerImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null

    if (!value) {
      setPreviewUrl(null)
    } else if (value instanceof File) {
      objectUrl = URL.createObjectURL(value)
      setPreviewUrl(objectUrl)
    } else {
      setPreviewUrl(value)
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [value])

  return (
    <div className="mt-1">
      <input
        id="cust-identity-photo"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          if (file) {
            onChange(file)
          }
        }}
      />

      {!previewUrl ? (
        <div
          onClick={() => document.getElementById("cust-identity-photo")?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-xl p-6 bg-muted/5 hover:bg-muted/10 cursor-pointer transition-all duration-200 group min-h-32 text-center"
        >
          <UploadCloud className="size-8 text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-2" />
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
            Choose or drop identity photo
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Max file size: 2MB (Formats: JPG, PNG, WEBP)
          </span>
        </div>
      ) : (
        <div className="relative group/photo overflow-hidden rounded-xl border border-muted-foreground/20 bg-muted/10 h-48 w-full flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Identity Proof"
            className="size-full object-cover transition-transform duration-300 group-hover/photo:scale-102"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200 backdrop-blur-[2px]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer shadow-md"
              onClick={() => document.getElementById("cust-identity-photo")?.click()}
            >
              <Camera className="size-3.5 mr-1.5" />
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer shadow-md"
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
