import { useState, useEffect } from "react"
import { Wilayah } from "@/types/wilayah"
import { fetchWilayahChildren } from "@/services/wilayah-service"

interface UseRegionProps {
  isOpen: boolean
  initialWilayahKode: string | null | undefined
  onWilayahKodeChange: (kode: string) => void
}

export function useRegion({ isOpen, initialWilayahKode, onWilayahKodeChange }: UseRegionProps) {
  const [provinces, setProvinces] = useState<Wilayah[]>([])
  const [regencies, setRegencies] = useState<Wilayah[]>([])
  const [districts, setDistricts] = useState<Wilayah[]>([])
  const [villages, setVillages] = useState<Wilayah[]>([])

  const [selectedProv, setSelectedProv] = useState<{ value: string; label: string } | null>(null)
  const [selectedReg, setSelectedReg] = useState<{ value: string; label: string } | null>(null)
  const [selectedDist, setSelectedDist] = useState<{ value: string; label: string } | null>(null)
  const [selectedVill, setSelectedVill] = useState<{ value: string; label: string } | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  // Reset all fields & lists (except root provinces)
  const resetRegion = () => {
    setSelectedProv(null)
    setSelectedReg(null)
    setSelectedDist(null)
    setSelectedVill(null)
    setRegencies([])
    setDistricts([])
    setVillages([])
  }

  // Load provinces and cascading options sequentially for edit mode, or load root provinces for create mode.
  useEffect(() => {
    if (!isOpen) {
      resetRegion()
      return
    }

    let isMounted = true

    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const provList = await fetchWilayahChildren()
        if (!isMounted) return

        setProvinces(provList)

        if (initialWilayahKode) {
          const parts = initialWilayahKode.split(".")
          const provCode = parts[0] || ""
          const regCode = parts.slice(0, 2).join(".") || ""
          const distCode = parts.slice(0, 3).join(".") || ""
          const villCode = parts.slice(0, 4).join(".") || ""

          const foundProv = provList.find((p) => p.kode === provCode)
          if (foundProv) {
            setSelectedProv({ value: foundProv.kode, label: foundProv.nama })
          }

          const fetchPromises: Promise<void>[] = []

          if (provCode) {
            fetchPromises.push(
              fetchWilayahChildren(provCode).then((data) => {
                if (!isMounted) return
                setRegencies(data)
                const found = data.find((r) => r.kode === regCode)
                if (found) {
                  setSelectedReg({ value: found.kode, label: found.nama })
                }
              })
            )
          }

          if (regCode) {
            fetchPromises.push(
              fetchWilayahChildren(regCode).then((data) => {
                if (!isMounted) return
                setDistricts(data)
                const found = data.find((d) => d.kode === distCode)
                if (found) {
                  setSelectedDist({ value: found.kode, label: found.nama })
                }
              })
            )
          }

          if (distCode) {
            fetchPromises.push(
              fetchWilayahChildren(distCode).then((data) => {
                if (!isMounted) return
                setVillages(data)
                const found = data.find((v) => v.kode === villCode)
                if (found) {
                  setSelectedVill({ value: found.kode, label: found.nama })
                }
              })
            )
          }

          await Promise.all(fetchPromises)
        } else {
          resetRegion()
        }
      } catch (err) {
        console.error("Error loading cascading region data:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [isOpen, initialWilayahKode])

  // Cascading Dropdown Select Handlers
  const handleProvChange = async (prov: { value: string; label: string } | null) => {
    setSelectedProv(prov)
    setSelectedReg(null)
    setSelectedDist(null)
    setSelectedVill(null)
    setDistricts([])
    setVillages([])

    if (prov && prov.value) {
      try {
        const data = await fetchWilayahChildren(prov.value)
        setRegencies(data)
      } catch (err) {
        console.error("Error fetching regencies:", err)
      }
      onWilayahKodeChange(prov.value)
    } else {
      setRegencies([])
      onWilayahKodeChange("")
    }
  }

  const handleRegChange = async (reg: { value: string; label: string } | null) => {
    setSelectedReg(reg)
    setSelectedDist(null)
    setSelectedVill(null)
    setVillages([])

    if (reg && reg.value) {
      try {
        const data = await fetchWilayahChildren(reg.value)
        setDistricts(data)
      } catch (err) {
        console.error("Error fetching districts:", err)
      }
      onWilayahKodeChange(reg.value)
    } else {
      setDistricts([])
      onWilayahKodeChange(selectedProv?.value || "")
    }
  }

  const handleDistChange = async (dist: { value: string; label: string } | null) => {
    setSelectedDist(dist)
    setSelectedVill(null)

    if (dist && dist.value) {
      try {
        const data = await fetchWilayahChildren(dist.value)
        setVillages(data)
      } catch (err) {
        console.error("Error fetching villages:", err)
      }
      onWilayahKodeChange(dist.value)
    } else {
      setVillages([])
      onWilayahKodeChange(selectedReg?.value || selectedProv?.value || "")
    }
  }

  const handleVillChange = (vill: { value: string; label: string } | null) => {
    setSelectedVill(vill)
    if (vill && vill.value) {
      onWilayahKodeChange(vill.value)
    } else {
      onWilayahKodeChange(selectedDist?.value || selectedReg?.value || selectedProv?.value || "")
    }
  }

  return {
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
    isLoading,
  }
}
