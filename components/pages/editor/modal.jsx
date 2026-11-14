"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Small accessible dialog: Escape closes, focus moves inside, clicking the backdrop closes. */
export function Modal({ title, onClose, children, footer, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    ref.current?.focus()
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("keydown", onKey, true)
      prev?.focus?.()
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`max-h-[90svh] w-full overflow-auto rounded-3xl bg-card p-5 shadow-2xl outline-none sm:p-6 ${wide ? "max-w-xl" : "max-w-md"}`}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>
        <div className="mt-3">{children}</div>
        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
