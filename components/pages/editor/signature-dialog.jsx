"use client"

import { useRef, useState } from "react"
import { Eraser, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Modal } from "./modal"

const INKS = ["#111827", "#1d4ed8", "#dc2626"]
const STORE_KEY = "paperless.signatures"
const MAX_SAVED = 4

function loadSaved() {
  try {
    const list = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]")
    return Array.isArray(list) ? list.filter((s) => typeof s === "string" && s.startsWith("data:image/png")) : []
  } catch {
    return []
  }
}
function persist(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, MAX_SAVED)))
  } catch {
    /* storage unavailable */
  }
}

/** Crop a canvas to the ink it contains, so the signature has no empty margins. */
function trim(canvas) {
  const { width, height } = canvas
  const d = canvas.getContext("2d").getImageData(0, 0, width, height).data
  let x0 = width, y0 = height, x1 = 0, y1 = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (d[(y * width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < x0) return null
  const pad = 6
  x0 = Math.max(0, x0 - pad)
  y0 = Math.max(0, y0 - pad)
  x1 = Math.min(width - 1, x1 + pad)
  y1 = Math.min(height - 1, y1 + pad)
  const out = document.createElement("canvas")
  out.width = x1 - x0 + 1
  out.height = y1 - y0 + 1
  out.getContext("2d").drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  return out
}

export function SignatureDialog({ onUse, onClose }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [ink, setInk] = useState(INKS[0])
  const [hasInk, setHasInk] = useState(false)
  const [remember, setRemember] = useState(true)
  const [saved, setSaved] = useState(loadSaved)

  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * canvasRef.current.width, y: ((e.clientY - r.top) / r.height) * canvasRef.current.height }
  }
  const down = (e) => {
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = point(e)
    const ctx = canvasRef.current.getContext("2d")
    ctx.fillStyle = ink
    ctx.beginPath()
    ctx.arc(last.current.x, last.current.y, 2.2, 0, Math.PI * 2)
    ctx.fill()
    setHasInk(true)
  }
  const move = (e) => {
    if (!drawing.current) return
    const p = point(e)
    const ctx = canvasRef.current.getContext("2d")
    ctx.strokeStyle = ink
    ctx.lineWidth = 4.4
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }
  const up = () => (drawing.current = false)
  const clear = () => {
    const c = canvasRef.current
    c.getContext("2d").clearRect(0, 0, c.width, c.height)
    setHasInk(false)
  }

  const use = () => {
    const cropped = trim(canvasRef.current)
    if (!cropped) return
    const src = cropped.toDataURL("image/png")
    if (remember) {
      const next = [src, ...saved.filter((s) => s !== src)].slice(0, MAX_SAVED)
      persist(next)
    }
    onUse({ src, mime: "image/png", w: cropped.width, h: cropped.height })
  }

  const pickSaved = (src) => {
    const img = new Image()
    img.onload = () => onUse({ src, mime: "image/png", w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
  }
  const removeSaved = (src) => {
    const next = saved.filter((s) => s !== src)
    setSaved(next)
    persist(next)
  }

  return (
    <Modal
      title="Add your signature"
      onClose={onClose}
      wide
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={use} disabled={!hasInk}>
            Use signature
          </Button>
        </>
      }
    >
      {saved.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Saved on this device</p>
          <div className="flex flex-wrap gap-2">
            {saved.map((s) => (
              <div key={s.slice(-40)} className="group relative rounded-xl border border-border bg-white">
                <button type="button" onClick={() => pickSaved(s)} aria-label="Use this saved signature" className="block rounded-xl p-2 hover:bg-primary-soft/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt="Saved signature" className="h-10 w-auto max-w-40 object-contain" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSaved(s)}
                  aria-label="Delete saved signature"
                  className="absolute -top-2 -right-2 hidden size-6 items-center justify-center rounded-full bg-card text-destructive shadow ring-1 ring-border group-focus-within:flex group-hover:flex"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mb-2 text-sm font-medium">Draw it with your mouse, finger or stylus</p>
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-white">
        <canvas
          ref={canvasRef}
          width={900}
          height={300}
          className="block h-auto w-full cursor-crosshair touch-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Signature drawing area"
        />
        {!hasInk && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Sign here</p>}
        <div className="pointer-events-none absolute right-6 bottom-12 left-6 border-b border-border" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Ink colour">
          {INKS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={ink === c}
              aria-label={`Ink ${c}`}
              onClick={() => setInk(c)}
              className="size-7 rounded-full ring-offset-2 ring-offset-card"
              style={{ background: c, boxShadow: ink === c ? `0 0 0 2px var(--card), 0 0 0 4px ${c}` : undefined }}
            />
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!hasInk}>
            <Eraser /> Clear
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-[#16a34a]" />
          Remember on this device
        </label>
      </div>
    </Modal>
  )
}
