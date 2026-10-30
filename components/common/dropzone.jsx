"use client"

import { useState } from "react"
import { CloudUpload } from "lucide-react"

import { cn } from "@/lib/utils"

/** Drag-and-drop area. A real <input> sits inside the <label>, so it is keyboard accessible. */
export function Dropzone({ extensions, label, multiple, disabled, onFiles, compact }) {
  const [dragging, setDragging] = useState(false)
  const accept = extensions.map((e) => `.${e}`).join(",")

  function handle(list) {
    const files = Array.from(list ?? [])
    if (files.length) onFiles(multiple ? files : files.slice(0, 1))
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (!disabled) handle(e.dataTransfer.files)
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/40 hover:bg-primary-soft/70",
        compact ? "gap-1 px-6 py-6" : "gap-3 px-6 py-14",
        dragging && "border-primary bg-primary-soft",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ""
        }}
      />
      <span className="flex size-12 items-center justify-center rounded-full bg-card text-primary-strong shadow-sm">
        <CloudUpload className="size-6" />
      </span>
      <span className="font-heading text-lg font-semibold">
        {dragging ? "Drop to add" : multiple ? "Drag and drop files here" : "Drag and drop your file here"}
      </span>
      <span className="text-sm text-muted-foreground">
        or <span className="font-semibold text-primary-strong underline underline-offset-2">browse your device</span>
        {" · "}
        {label}
      </span>
    </label>
  )
}
