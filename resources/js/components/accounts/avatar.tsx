import * as React from "react"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { CircleUserRoundIcon, UploadCloudIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface Account {
  id: number
  name: string
  email: string
  phone: string
  country: string
  address: string
  avatar: string | null
}

interface AvatarProps {
  isOpen: boolean
  editingUser: Account | null
  data: {
    name: string
    avatar: File | string | null
  }
  setData: (key: string, value: any) => void
  errors: Record<string, string>
  
  avatarPreview: string | null
  setAvatarPreview: React.Dispatch<React.SetStateAction<string | null>>
  avatarMode: "upload" | "micah"
  setAvatarMode: React.Dispatch<React.SetStateAction<"upload" | "micah">>
  avatarSeedIndex: number
  setAvatarSeedIndex: React.Dispatch<React.SetStateAction<number>>
  avatarMouth: string
  setAvatarMouth: React.Dispatch<React.SetStateAction<string>>
  avatarShirtColor: string
  setAvatarShirtColor: React.Dispatch<React.SetStateAction<string>>
  avatarBgColor: string
  setAvatarBgColor: React.Dispatch<React.SetStateAction<string>>
}

// Helper to get a secondary color for linear gradients
function getGradientColor(hex: string): string {
  if (hex === "default") return "default"
  
  // If it's a shorthand hex, expand it
  let cleanHex = hex.replace("#", "")
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(char => char + char).join("")
  }
  
  // If length is not 6, return a fallback
  if (cleanHex.length !== 6) return "ffffff"

  // Parse hex to rgb
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  
  // Create a secondary color by darkening light colors and lightening dark colors
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const factor = brightness > 128 ? 0.75 : 1.3 // adjust brightness factor
  
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const r2 = clamp(r * factor)
  const g2 = clamp(g * factor)
  const b2 = clamp(b * factor)
  
  const toHex = (val: number) => val.toString(16).padStart(2, "0")
  return `${toHex(r2)}${toHex(g2)}${toHex(b2)}`
}

export function AvatarConfig({
  isOpen,
  editingUser,
  data,
  setData,
  errors,
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
  setAvatarBgColor
}: AvatarProps) {
  // Sync Micah avatar when name, seed index, mouth, shirt color, or background color changes while in Micah mode
  React.useEffect(() => {
    if (isOpen && avatarMode === "micah") {
      const baseSeed = data.name.trim() || "avatar"
      const seed = `${baseSeed}-${avatarSeedIndex}`
      
      const params = new URLSearchParams()
      params.set("seed", seed)
      params.set("backgroundType", "gradientLinear")
      if (avatarMouth !== "default") {
        params.set("mouth", avatarMouth)
      }
      if (avatarShirtColor !== "default") {
        params.set("shirtColor", avatarShirtColor)
      }
      if (avatarBgColor !== "default") {
        const secondaryBg = getGradientColor(avatarBgColor)
        params.set("backgroundColor", `${avatarBgColor},${secondaryBg}`)
      } else {
        params.set("backgroundColor", "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf")
      }

      const micahUrl = `https://api.dicebear.com/9.x/micah/svg?${params.toString()}`
      setAvatarPreview(micahUrl)
      setData("avatar", micahUrl)
    }
  }, [data.name, avatarMode, avatarSeedIndex, avatarMouth, avatarShirtColor, avatarBgColor, isOpen])

  // Handle avatar file selection & preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData("avatar", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle avatar navigation
  const handlePrevAvatar = () => {
    setAvatarSeedIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextAvatar = () => {
    setAvatarSeedIndex((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col items-center justify-start w-full gap-4">
      <div className="flex items-center gap-3 w-full justify-center">
        {avatarMode === "micah" && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-full shrink-0"
            onClick={handlePrevAvatar}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        )}

        <div className="size-28 rounded-full overflow-hidden border-2 border-dashed border-input bg-neutral-900 shadow-xs flex items-center justify-center relative group/avatar transition-all hover:border-primary/50 shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="size-28 object-cover" />
          ) : (
            <CircleUserRoundIcon className="size-16 text-neutral-400" />
          )}
        </div>

        {avatarMode === "micah" && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-full shrink-0"
            onClick={handleNextAvatar}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Avatar Type Selection Switch */}
      <div className="flex flex-col gap-2 w-full px-2">
        <div className="flex rounded-lg border border-input p-0.5 bg-muted text-muted-foreground text-xs">
          <button
            type="button"
            onClick={() => {
              setAvatarMode("upload")
              setData("avatar", null)
              if (editingUser && editingUser.avatar && !editingUser.avatar.includes("micah")) {
                setAvatarPreview(editingUser.avatar)
              } else {
                setAvatarPreview(null)
              }
            }}
            className={`flex-1 py-1 rounded-md font-medium text-center transition-all ${
              avatarMode === "upload"
                ? "bg-background text-foreground shadow-xs"
                : "hover:text-foreground"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setAvatarMode("micah")
              const seed = data.name.trim() || "avatar"
              const params = new URLSearchParams()
              params.set("seed", `${seed}-${avatarSeedIndex}`)
              params.set("backgroundType", "gradientLinear")
              if (avatarMouth !== "default") {
                params.set("mouth", avatarMouth)
              }
              if (avatarShirtColor !== "default") {
                params.set("shirtColor", avatarShirtColor)
              }
              if (avatarBgColor !== "default") {
                const secondaryBg = getGradientColor(avatarBgColor)
                params.set("backgroundColor", `${avatarBgColor},${secondaryBg}`)
              } else {
                params.set("backgroundColor", "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf")
              }
              const micahUrl = `https://api.dicebear.com/9.x/micah/svg?${params.toString()}`
              setAvatarPreview(micahUrl)
              setData("avatar", micahUrl)
            }}
            className={`flex-1 py-1 rounded-md font-medium text-center transition-all ${
              avatarMode === "micah"
                ? "bg-background text-foreground shadow-xs"
                : "hover:text-foreground"
            }`}
          >
           Avatar
          </button>
        </div>
      </div>
      
      <div className="text-center w-full">
        {avatarMode === "upload" ? (
          <>
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-input rounded-md text-xs font-semibold text-foreground bg-background hover:bg-accent cursor-pointer transition-colors shadow-xs"
            >
              <UploadCloudIcon className="size-3.5 text-muted-foreground" />
              Upload Photo
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-[10px] text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
          </>
        ) : (
          <div className="w-full flex flex-col gap-3 px-2 text-left">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Mouth Expression</label>
              <select
                value={avatarMouth}
                onChange={(e) => setAvatarMouth(e.target.value)}
                className="w-full bg-neutral-900 text-neutral-200 border border-input rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="default">Default (Random)</option>
                <option value="frown">Frown</option>
                <option value="laughing">Laughing</option>
                <option value="nervous">Nervous</option>
                <option value="pucker">Pucker</option>
                <option value="sad">Sad</option>
                <option value="smile">Smile</option>
                <option value="smirk">Smirk</option>
                <option value="surprised">Surprised</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Shirt Color</label>
              <select
                value={avatarShirtColor}
                onChange={(e) => setAvatarShirtColor(e.target.value)}
                className="w-full bg-neutral-900 text-neutral-200 border border-input rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="default">Default (Random)</option>
                <option value="6366f1">Indigo</option>
                <option value="3b82f6">Blue</option>
                <option value="ec4899">Pink</option>
                <option value="10b981">Emerald</option>
                <option value="f59e0b">Amber</option>
                <option value="ef4444">Red</option>
                <option value="8b5cf6">Purple</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Background Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Default / Random Circle */}
                <button
                  type="button"
                  onClick={() => setAvatarBgColor("default")}
                  className={`size-6 rounded-full border flex items-center justify-center text-[8px] font-bold shrink-0 ${
                    avatarBgColor === "default"
                      ? "border-primary ring-1 ring-primary bg-background text-foreground"
                      : "border-input bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                  title="Default Random Color"
                >
                  Rand
                </button>
                
                {/* Preset Swatches */}
                {["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarBgColor(color)}
                    style={{ backgroundColor: `#${color}` }}
                    className={`size-6 rounded-full border shrink-0 transition-all ${
                      avatarBgColor === color
                        ? "border-primary ring-1 ring-primary scale-110 shadow-xs"
                        : "border-input hover:scale-105"
                    }`}
                  />
                ))}

                {/* Custom Color Picker Swatch */}
                <div className="relative size-6 rounded-full border border-input overflow-hidden flex items-center justify-center cursor-pointer bg-background hover:scale-105 shrink-0" title="Custom Color Picker">
                  <input
                    type="color"
                    value={avatarBgColor !== "default" && avatarBgColor.match(/^[a-fA-F0-9]{6}$/) ? `#${avatarBgColor}` : "#ffffff"}
                    onChange={(e) => {
                      const hex = e.target.value.replace("#", "")
                      setAvatarBgColor(hex)
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer size-full"
                  />
                  <span className="text-xs font-semibold">+</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <FieldError className="mt-1">{errors.avatar}</FieldError>
      </div>
    </div>
  )
}
