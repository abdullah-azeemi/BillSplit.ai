"use client"

import type React from "react"

import { Loader2 } from "lucide-react"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  variant?: "primary" | "outline"
  className?: string
  disabled?: boolean
}

export default function Button({
  children,
  onClick,
  loading = false,
  variant = "primary",
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variantClasses = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
    outline:
      "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

