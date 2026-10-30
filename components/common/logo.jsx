import Link from "next/link"

import { cn } from "@/lib/utils"

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#16A34A" />
      <path d="M10 6h8l5 5v13a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="#fff" />
      <path d="M18 6l5 5h-3a2 2 0 0 1-2-2V6Z" fill="#BBF7D0" />
      <path d="M11.5 16h9M11.5 19.5h9M11.5 23h5" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }) {
  return (
    <Link
      href="/home"
      aria-label="PaperLess home"
      className={cn("inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40", className)}
    >
      <LogoMark />
      <span className="font-heading text-xl font-bold tracking-tight">PaperLess</span>
    </Link>
  )
}
