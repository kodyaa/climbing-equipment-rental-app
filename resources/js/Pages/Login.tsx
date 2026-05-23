import * as React from "react"
import { Head } from "@inertiajs/react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <>
      <Head title="Login - SummitRent by Kodya" />
      <div className="grid min-h-svh lg:grid-cols-2 bg-background">
        {/* Left Column - Form */}
        <div className="flex flex-col gap-4 p-6 md:p-10 justify-between">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2.5 font-bold text-lg select-none">
              <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 overflow-hidden shadow-xs">
                <img
                  src="/Logo2.png"
                  alt="Kodya Logo"
                  className="size-7 object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="tracking-tight bg-linear-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent dark:from-white dark:to-neutral-300">
                  SummitRent
                </span>
                <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                  by Kodya
                </span>
              </div>
            </a>
          </div>

          <div className="flex flex-1 items-center justify-center py-6">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>

          <div className="text-center md:text-left text-[11px] text-muted-foreground mt-auto">
            &copy; {new Date().getFullYear()} SummitRent. Designed & developed by{" "}
            <a
              href="#"
              className="font-semibold text-foreground hover:underline transition-colors underline-offset-4"
            >
              Kodya
            </a>
          </div>
        </div>

        {/* Right Column - Brand & Image */}
        <div className="relative hidden bg-neutral-950 lg:flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-950 to-neutral-900 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-neutral-800 to-neutral-700 opacity-30 blur-xl transition duration-1000 group-hover:opacity-50" />
              <img
                src="/Logo2.png"
                alt="Kodya Logo"
                className="relative max-h-52 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-2 mt-4 text-white">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
                SummitRent
              </h2>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-[280px]">
                Rent premium climbing equipment for your next adventure. Safe, certified gear when and where you need it. Developed with precision by Kodya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
