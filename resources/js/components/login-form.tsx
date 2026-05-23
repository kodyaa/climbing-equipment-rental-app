import * as React from "react"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { data, setData, post, processing, errors, reset } = useForm({
    login: "",
    password: "",
    remember: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const loginToast = toast.loading("Verifying credentials...")
    post("/login", {
      onSuccess: () => {
        toast.success("Successfully logged in! Redirecting...", { id: loginToast })
      },
      onError: (errs) => {
        toast.error(errs.login || "Failed to log in. Please check your credentials.", { id: loginToast })
      },
      onFinish: () => reset("password"),
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-xs text-muted-foreground">
            Enter your credentials to access your SummitRent account
          </p>
        </div>
        
        <Field>
          <FieldLabel htmlFor="login">Email or Name</FieldLabel>
          <Input
            id="login"
            type="text"
            placeholder="name@example.com or name"
            required
            className="bg-background"
            value={data.login}
            onChange={(e) => setData("login", e.target.value)}
          />
          {errors.login && (
            <span className="text-[11px] font-medium text-destructive leading-none mt-1.5 block">
              {errors.login}
            </span>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-background"
            value={data.password}
            onChange={(e) => setData("password", e.target.value)}
          />
          {errors.password && (
            <span className="text-[11px] font-medium text-destructive leading-none mt-1.5 block">
              {errors.password}
            </span>
          )}
        </Field>

        <Field orientation="horizontal" className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="rounded border-input text-primary focus:ring-ring focus:ring-offset-2"
            checked={data.remember}
            onChange={(e) => setData("remember", e.target.checked)}
          />
          <FieldLabel htmlFor="remember" className="select-none text-xs font-normal text-muted-foreground cursor-pointer">
            Remember me on this device
          </FieldLabel>
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={processing}>
            {processing ? "Signing in..." : "Sign in"}
          </Button>
        </Field>


      </FieldGroup>
    </form>
  )
}
