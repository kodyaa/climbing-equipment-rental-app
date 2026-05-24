import * as React from "react"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"
import { Customer } from "@/types/customer"

interface UseCustomerFormProps {
  editingCustomer: Customer | null
  onOpenChange: (open: boolean) => void
  resetRegion: () => void
}

export function useCustomerForm({ editingCustomer, onOpenChange, resetRegion }: UseCustomerFormProps) {
  const [idNumberError, setIdNumberError] = React.useState("")
  const [isIdChecking, setIsIdChecking] = React.useState(false)
  const [emailError, setEmailError] = React.useState("")
  const [isEmailChecking, setIsEmailChecking] = React.useState(false)

  const { data, setData, post, errors, processing, reset } = useForm({
    name: "",
    phone: "",
    id_number: "",
    identity_photo: null as File | string | null,
    email: "",
    wilayah_kode: "",
    address: "",
    _method: "post",
  })

  // Sync editing customer values into form or reset
  React.useEffect(() => {
    if (editingCustomer) {
      setData({
        name: editingCustomer.name,
        phone: editingCustomer.phone,
        id_number: editingCustomer.id_number || "",
        identity_photo: editingCustomer.identity_photo || null,
        email: editingCustomer.email || "",
        wilayah_kode: editingCustomer.wilayah_kode || "",
        address: editingCustomer.address || "",
        _method: "put",
      })
    } else {
      reset()
      setIdNumberError("")
      setIsIdChecking(false)
      setEmailError("")
      setIsEmailChecking(false)
    }
  }, [editingCustomer])

  // Live NIK existence check with 500ms debounce
  React.useEffect(() => {
    if (!data.id_number) {
      setIdNumberError("")
      setIsIdChecking(false)
      return
    }

    setIsIdChecking(true)

    const timer = setTimeout(() => {
      const excludeParam = editingCustomer ? `&exclude_id=${editingCustomer.id}` : ""
      fetch(`/customers/check-id?id_number=${data.id_number}${excludeParam}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.exists) {
            setIdNumberError(`This NIK is already registered under "${resData.name}"`)
          } else {
            setIdNumberError("")
          }
        })
        .catch(() => setIdNumberError(""))
        .finally(() => {
          setIsIdChecking(false)
        })
    }, 500)

    return () => {
      clearTimeout(timer)
      setIsIdChecking(false)
    }
  }, [data.id_number, editingCustomer])

  // Live Email existence check with 500ms debounce
  React.useEffect(() => {
    if (!data.email) {
      setEmailError("")
      setIsEmailChecking(false)
      return
    }

    // Basic email format check before calling API
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    if (!isEmailValid) {
      setEmailError("Invalid email address format.")
      setIsEmailChecking(false)
      return
    }

    setIsEmailChecking(true)

    const timer = setTimeout(() => {
      const excludeParam = editingCustomer ? `&exclude_id=${editingCustomer.id}` : ""
      fetch(`/customers/check-email?email=${encodeURIComponent(data.email)}${excludeParam}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.exists) {
            setEmailError(`This email is already registered under "${resData.name}"`)
          } else {
            setEmailError("")
          }
        })
        .catch(() => setEmailError(""))
        .finally(() => {
          setIsEmailChecking(false)
        })
    }, 500)

    return () => {
      clearTimeout(timer)
      setIsEmailChecking(false)
    }
  }, [data.email, editingCustomer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (idNumberError) {
      toast.error("Please fix the NIK registration error first.")
      return
    }

    if (emailError) {
      toast.error("Please fix the email registration error first.")
      return
    }

    if (editingCustomer) {
      post(`/customers/${editingCustomer.id}`, {
        onSuccess: () => {
          onOpenChange(false)
          toast.success(`${data.name} updated successfully!`)
        },
        onError: () => {
          toast.error("Failed to update customer. Please check inputs.")
        },
      })
    } else {
      post("/customers", {
        onSuccess: () => {
          onOpenChange(false)
          toast.success("Customer added successfully!")
        },
        onError: () => {
          toast.error("Failed to add customer. Please check inputs.")
        },
      })
    }
  }

  const handleCancel = () => {
    reset()
    resetRegion()
    setIdNumberError("")
    setIsIdChecking(false)
    setEmailError("")
    setIsEmailChecking(false)
    onOpenChange(false)
  }

  return {
    data,
    setData,
    errors,
    processing,
    idNumberError,
    isIdChecking,
    emailError,
    isEmailChecking,
    handleSubmit,
    handleCancel,
  }
}
