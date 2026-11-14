"use client"

import { memo, useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, Copy, FilePlus2, MoreHorizontal, RotateCcw, RotateCw, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { dispSize } from "./editor-core"

const THUMB_W = 112

function Thumb({ page, doc }) {
  const ref = useRef(null)
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const size = dispSize(page)
  const h = Math.round((THUMB_W * size.h) / size.w)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "300px" })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || page.blank) return
    let cancelled = false
    let task
    ;(async () => {
      try {
        const p = await doc.getPage(page.source + 1)
        if (cancelled) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const rotation = (page.baseRotate + page.extra) % 360
        const base = p.getViewport({ scale: 1, rotation })
        const viewport = p.getViewport({ scale: (THUMB_W * dpr) / base.width, rotation })
        const off = document.createElement("canvas")
        off.width = Math.floor(viewport.width)
        off.height = Math.floor(viewport.height)
        task = p.render({ canvasContext: off.getContext("2d"), viewport })
        await task.promise
        if (cancelled || !ref.current) return
        ref.current.width = off.width
        ref.current.height = off.height
        ref.current.getContext("2d").drawImage(off, 0, 0)
      } catch {
        /* cancelled */
      }
    })()
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [visible, doc, page.source, page.blank, page.baseRotate, page.extra])

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-border" style={{ width: THUMB_W, height: h }}>
      {!page.blank && <canvas ref={ref} className="size-full" />}
    </div>
  )
}

function MenuItem({ icon: Icon, children, onClick, danger, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.8rem] font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        danger && "text-destructive hover:bg-destructive/10"
      )}
    >
      <Icon className="size-3.5 shrink-0" /> {children}
    </button>
  )
}

const PageItem = memo(function PageItem({ page, index, total, doc, current, count, onGo, ops, drag }) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menu) return
    const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false)
    const esc = (e) => e.key === "Escape" && setMenu(false)
    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", esc)
    }
  }, [menu])

  const run = (fn) => () => {
    setMenu(false)
    fn()
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", String(index))
        drag.start(index)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        drag.over(index)
      }}
      onDrop={(e) => {
        e.preventDefault()
        drag.drop(index)
      }}
      onDragEnd={drag.end}
      className={cn("relative flex flex-col items-center gap-1 rounded-xl p-2", drag.overIndex === index && drag.from !== index && "bg-primary-soft ring-2 ring-primary/50")}
    >
      <button
        type="button"
        onClick={() => onGo(page.id)}
        aria-label={`Go to page ${index + 1}`}
        aria-current={current ? "page" : undefined}
        className={cn("rounded-lg p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40", current ? "bg-primary-soft ring-2 ring-primary" : "hover:bg-muted")}
      >
        <Thumb page={page} doc={doc} />
      </button>
      <div className="flex w-full items-center justify-between px-1 text-xs text-muted-foreground">
        <span className={cn("font-medium tabular-nums", current && "text-primary-strong")}>
          {index + 1}
          {count > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 py-px text-[0.65rem] font-semibold text-primary-foreground">{count}</span>}
        </span>
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-label={`Page ${index + 1} options`}
          aria-expanded={menu}
          className="rounded-md p-1 hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>
      {menu && (
        <div ref={menuRef} role="menu" className="absolute right-1 bottom-9 z-30 w-48 rounded-xl border border-border bg-card p-1 shadow-lg">
          <MenuItem icon={RotateCw} onClick={run(() => ops.rotate(page.id, true))}>Rotate right</MenuItem>
          <MenuItem icon={RotateCcw} onClick={run(() => ops.rotate(page.id, false))}>Rotate left</MenuItem>
          <MenuItem icon={Copy} onClick={run(() => ops.duplicate(page.id))}>Duplicate page</MenuItem>
          <MenuItem icon={FilePlus2} onClick={run(() => ops.insertBlank(page.id))}>Insert blank page after</MenuItem>
          <MenuItem icon={ArrowUp} disabled={index === 0} onClick={run(() => ops.move(page.id, -1))}>Move up</MenuItem>
          <MenuItem icon={ArrowDown} disabled={index === total - 1} onClick={run(() => ops.move(page.id, 1))}>Move down</MenuItem>
          <MenuItem icon={Trash2} danger disabled={total === 1} onClick={run(() => ops.remove(page.id))}>Delete page</MenuItem>
        </div>
      )}
    </li>
  )
})

export function Thumbnails({ pages, doc, currentId, counts, onGo, ops }) {
  const [from, setFrom] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const drag = {
    from,
    overIndex,
    start: setFrom,
    over: setOverIndex,
    drop: (to) => {
      if (from != null && from !== to) ops.reorder(from, to)
      setFrom(null)
      setOverIndex(null)
    },
    end: () => {
      setFrom(null)
      setOverIndex(null)
    },
  }
  return (
    <ul className="flex flex-col items-center gap-1 p-2" aria-label="Pages">
      {pages.map((p, i) => (
        <PageItem key={p.id} page={p} index={i} total={pages.length} doc={doc} current={p.id === currentId} count={counts[p.id] ?? 0} onGo={onGo} ops={ops} drag={drag} />
      ))}
      <li className="w-full px-2 pt-1">
        <button
          type="button"
          onClick={() => ops.insertBlank(pages[pages.length - 1].id)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-2 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:bg-primary-soft/50 hover:text-primary-strong"
        >
          <FilePlus2 className="size-3.5" /> Add blank page
        </button>
      </li>
    </ul>
  )
}
