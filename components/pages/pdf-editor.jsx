"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { FabricImage, util } from "fabric"
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  Info,
  LoaderCircle,
  Minus,
  PanelLeft,
  Plus,
  Redo2,
  Undo2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DEFAULT_STYLE,
  PERSIST,
  TOOL_GROUP,
  applyStyle,
  decorate,
  dispSize,
  groupOf,
  kindOf,
  prepareImage,
  readStyle,
  rotateObjects,
  toAnnotation,
  uid,
  unsupportedChars,
} from "./editor/editor-core"
import { Modal } from "./editor/modal"
import { PageView } from "./editor/page-view"
import { SignatureDialog } from "./editor/signature-dialog"
import { Thumbnails } from "./editor/thumbnails"
import { PropertiesBar, SHAPE_LIST, TOOL_HINTS, TOOL_LIST, ToolBar } from "./editor/toolbar"

// Served from our own origin so the production CSP (script-src 'self') allows it.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js"

const MIN_ZOOM = 0.25
const MAX_ZOOM = 4
const MAX_HISTORY = 100
const SHORTCUTS = Object.fromEntries([...TOOL_LIST, ...SHAPE_LIST].filter((t) => t.key).map((t) => [t.key.toLowerCase(), t.id]))
const clone = (v) => JSON.parse(JSON.stringify(v))

/**
 * Full-screen PDF editor.
 *
 * Every page keeps its annotations as plain JSON in `store` (page id -> objects, in PDF points). Only pages near
 * the screen get a live Fabric canvas, which keeps big documents fast. Page operations (rotate, delete, reorder,
 * insert blank) only change the `pages` list; the backend applies it together with the annotations.
 *
 * Props: file (File), hidden, saving, error, onSave({annotations, pages}), onLoadError(msg), onChangeFile()
 */
export default function PdfEditor({ file, hidden, saving, error, onSave, onLoadError, onChangeFile }) {
  const [doc, setDoc] = useState(null)
  const [pages, setPages] = useState([])
  const [tool, setToolState] = useState("select")
  const [style, setStyle] = useState(DEFAULT_STYLE)
  const [selection, setSelection] = useState(null)
  const [pending, setPending] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [viewW, setViewW] = useState(0)
  const [currentId, setCurrentId] = useState(null)
  const [editCount, setEditCount] = useState(0)
  const [counts, setCounts] = useState({})
  const [hist, setHist] = useState({ undo: 0, redo: 0 })
  const [showThumbs, setShowThumbs] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768)
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [warn, setWarn] = useState(null)
  const [notice, setNotice] = useState(null)
  const [preparing, setPreparing] = useState(false)

  const scrollRoot = useRef(null)
  const imageInput = useRef(null)
  const pagesRef = useRef([])
  const store = useRef(new Map())
  const canvases = useRef(new Map())
  const [pageEls] = useState(() => new Map())
  const history = useRef({ undo: [], redo: [] })
  const clipboard = useRef(null)
  const latest = useRef({ tool, style, pending, selection, currentId })
  const noticeTimer = useRef(null)

  useEffect(() => {
    latest.current = { tool, style, pending, selection, currentId }
  })

  const flash = useCallback((message) => {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), 3500)
  }, [])

  // ---- the API the page views use (stable identity) ----
  const [api] = useState(() => {
    const setPagesBoth = (next) => {
      pagesRef.current = next
      setPages(next)
    }
    const recount = () => {
      const c = {}
      let total = 0
      for (const p of pagesRef.current) {
        const n = (store.current.get(p.id) ?? []).length
        if (n) {
          c[p.id] = n
          total += n
        }
      }
      setCounts(c)
      setEditCount(total)
    }
    const syncHist = () => setHist({ undo: history.current.undo.length, redo: history.current.redo.length })
    const push = (entry) => {
      history.current.undo.push(entry)
      if (history.current.undo.length > MAX_HISTORY) history.current.undo.shift()
      history.current.redo = []
      syncHist()
    }
    const setTool = (t) => {
      setToolState(t)
      if (t !== "place") setPending(null)
    }
    const activeCanvas = () => {
      const id = latest.current.selection?.pageId
      return id ? { id, canvas: canvases.current.get(id) } : { id: null, canvas: null }
    }

    const a = {
      latest,
      scrollRoot,
      pageEls,
      setTool,
      setPagesBoth,
      recount,
      syncHist,
      push,
      flash,
      registerCanvas: (id, canvas) => (canvas ? canvases.current.set(id, canvas) : canvases.current.delete(id)),
      getStore: (id) => store.current.get(id) ?? [],
      setActivePage: (id) => setCurrentId(id),

      commit(id, canvas) {
        const before = store.current.get(id) ?? []
        const after = canvas.toObject(PERSIST).objects
        store.current.set(id, after)
        push({ type: "page", id, before, after })
        recount()
      },

      onSelection(id, canvas) {
        const objs = canvas.getActiveObjects()
        if (!objs.length) {
          setSelection((s) => (s?.pageId === id ? null : s))
          return
        }
        canvases.current.forEach((c, k) => {
          if (k !== id && c.getActiveObject()) {
            c.discardActiveObject()
            c.requestRenderAll()
          }
        })
        const kind = objs.length > 1 ? "multi" : kindOf(objs[0])
        setSelection({ pageId: id, kind, n: objs.length })
        setCurrentId(id)
        if (objs.length === 1) setStyle((s) => ({ ...s, ...readStyle(objs[0]) }))
      },

      changeStyle(patch) {
        setStyle((s) => ({ ...s, ...patch }))
        const { canvas } = activeCanvas()
        if (!canvas) return
        const objs = canvas.getActiveObjects()
        if (!objs.length) return
        objs.forEach((o) => applyStyle(o, patch))
        canvas.requestRenderAll()
        canvas.commitNow?.()
      },

      removeSelected() {
        const { canvas } = activeCanvas()
        if (!canvas) return
        const objs = canvas.getActiveObjects()
        if (!objs.length) return
        canvas.discardActiveObject()
        objs.forEach((o) => canvas.remove(o))
        canvas.requestRenderAll()
        canvas.commitNow?.()
      },

      async duplicateSelected() {
        const { canvas } = activeCanvas()
        if (!canvas) return
        const objs = canvas.getActiveObjects()
        if (!objs.length) return
        canvas.discardActiveObject()
        let last = null
        for (const o of objs) {
          const c = await o.clone(PERSIST)
          c.set({ left: o.left + 14, top: o.top + 14 })
          decorate(c)
          canvas.add(c)
          last = c
        }
        if (last) canvas.setActiveObject(last)
        canvas.requestRenderAll()
        canvas.commitNow?.()
      },

      copySelected() {
        const { canvas } = activeCanvas()
        const objs = canvas?.getActiveObjects() ?? []
        if (objs.length !== 1) return flash("Select a single item to copy it.")
        clipboard.current = objs[0].toObject(PERSIST)
        flash("Copied")
      },

      async paste() {
        if (!clipboard.current) return
        const id = latest.current.selection?.pageId ?? latest.current.currentId ?? pagesRef.current[0]?.id
        const canvas = canvases.current.get(id)
        if (!canvas) return
        const [obj] = await util.enlivenObjects([clipboard.current])
        obj.set({ left: obj.left + 16, top: obj.top + 16 })
        clipboard.current = obj.toObject(PERSIST)
        decorate(obj)
        canvas.discardActiveObject()
        canvas.add(obj)
        canvas.setActiveObject(obj)
        canvas.requestRenderAll()
        canvas.commitNow?.()
      },

      reorderZ(forward) {
        const { canvas } = activeCanvas()
        if (!canvas) return
        const objs = canvas.getActiveObjects()
        canvas.discardActiveObject()
        objs.forEach((o) => (forward ? canvas.bringObjectForward(o) : canvas.sendObjectBackwards(o)))
        if (objs.length === 1) canvas.setActiveObject(objs[0])
        canvas.requestRenderAll()
        canvas.commitNow?.()
      },

      nudge(dx, dy) {
        const { canvas } = activeCanvas()
        const o = canvas?.getActiveObject()
        if (!o) return
        o.set({ left: o.left + dx, top: o.top + dy })
        o.setCoords()
        canvas.requestRenderAll()
        canvas.commitNow?.()
      },

      startPlace(data) {
        setPending(data)
        setToolState("place")
      },

      placePending(pageId, canvas, p) {
        const pend = latest.current.pending
        const page = pagesRef.current.find((x) => x.id === pageId)
        if (!pend || !page) return setTool("select")
        const size = dispSize(page)
        FabricImage.fromURL(pend.src).then((img) => {
          const target = pend.kind === "signature" ? Math.min(180, size.w * 0.35) : Math.min(260, size.w * 0.45)
          img.scaleToWidth(target)
          const w = img.getScaledWidth()
          const h = img.getScaledHeight()
          img.set({
            kind: "image",
            mime: pend.mime,
            left: Math.min(Math.max(p.x - w / 2, 0), Math.max(0, size.w - w)),
            top: Math.min(Math.max(p.y - h / 2, 0), Math.max(0, size.h - h)),
          })
          decorate(img)
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.requestRenderAll()
          canvas.commitNow?.()
          setTool("select")
        })
      },

      async reloadCanvas(id, objects) {
        const c = canvases.current.get(id)
        if (!c) return
        c._loading = true
        c.discardActiveObject()
        await c.loadFromJSON({ objects })
        c.getObjects().forEach(decorate)
        c._loading = false
        c.requestRenderAll()
      },
    }
    return a
  })

  // ---- load the PDF ----
  useEffect(() => {
    let cancelled = false
    let loaded = null
    ;(async () => {
      try {
        const buf = await file.arrayBuffer()
        loaded = await pdfjsLib.getDocument({
          data: new Uint8Array(buf),
          cMapUrl: "/pdfjs/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "/pdfjs/standard_fonts/",
          isEvalSupported: false,
        }).promise
        const list = await Promise.all(
          Array.from({ length: loaded.numPages }, async (_, i) => {
            const p = await loaded.getPage(i + 1)
            const v = p.getViewport({ scale: 1 })
            return { id: uid(), source: i, blank: false, base: { w: v.width, h: v.height }, baseRotate: p.rotate, extra: 0 }
          })
        )
        if (cancelled) return loaded.destroy()
        api.setPagesBoth(list)
        setCurrentId(list[0].id)
        setDoc(loaded)
      } catch (err) {
        if (cancelled) return
        onLoadError?.(
          err?.name === "PasswordException"
            ? "This PDF is password protected. Unlock it with the Unlock PDF tool first."
            : "We couldn't open this PDF. It may be damaged."
        )
      }
    })()
    return () => {
      cancelled = true
      loaded?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, api])

  // ---- scroll area: width, current page, ctrl+wheel zoom ----
  useEffect(() => {
    const el = scrollRoot.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setViewW(entry.contentRect.width)
    })
    ro.observe(el)
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const line = el.getBoundingClientRect().top + el.clientHeight * 0.35
        for (const p of pagesRef.current) {
          const node = pageEls.get(p.id)
          if (node && node.getBoundingClientRect().bottom > line) return setCurrentId(p.id)
        }
      })
    }
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1) * 100) / 100)))
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", onScroll)
      el.removeEventListener("wheel", onWheel)
    }
  }, [doc, pageEls])

  // ---- lock page scroll while the editor is open ----
  useEffect(() => {
    if (hidden) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [hidden])

  // ---- warn before leaving with unsaved work ----
  useEffect(() => {
    if (!editCount || hidden) return
    const warnLeave = (e) => e.preventDefault()
    window.addEventListener("beforeunload", warnLeave)
    return () => window.removeEventListener("beforeunload", warnLeave)
  }, [editCount, hidden])

  // ---- zoom ----
  const maxW = useMemo(() => pages.reduce((m, p) => Math.max(m, dispSize(p).w), 1), [pages])
  const fit = viewW ? Math.min(Math.max((viewW - 32) / maxW, 0.3), 1.3) : 1
  const scale = fit * zoom
  const changeZoom = (f) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * f * 100) / 100)))

  // ---- tools ----
  const setTool = api.setTool
  const chooseImage = () => imageInput.current?.click()
  const onImageFile = async (e) => {
    const picked = e.target.files?.[0]
    e.target.value = ""
    if (!picked) return
    if (!picked.type.startsWith("image/")) return flash("Please choose an image file (PNG, JPG…).")
    if (picked.size > 8 * 1024 * 1024) return flash("Images must be 8 MB or smaller.")
    setPreparing(true)
    try {
      api.startPlace({ ...(await prepareImage(picked)), kind: "image" })
    } catch (err) {
      flash(err.message)
    } finally {
      setPreparing(false)
    }
  }

  // ---- history ----
  const applyEntry = useCallback(
    async (entry, undo) => {
      if (entry.type === "page") {
        const objects = undo ? entry.before : entry.after
        store.current.set(entry.id, objects)
        await api.reloadCanvas(entry.id, objects)
      } else {
        api.setPagesBoth(undo ? entry.beforePages : entry.afterPages)
        const patch = undo ? entry.storeBefore : entry.storeAfter
        for (const [id, objects] of Object.entries(patch ?? {})) store.current.set(id, objects)
      }
      api.recount()
      api.syncHist()
      setSelection(null)
    },
    [api]
  )
  const undo = useCallback(async () => {
    const entry = history.current.undo.pop()
    if (!entry) return
    history.current.redo.push(entry)
    await applyEntry(entry, true)
  }, [applyEntry])
  const redo = useCallback(async () => {
    const entry = history.current.redo.pop()
    if (!entry) return
    history.current.undo.push(entry)
    await applyEntry(entry, false)
  }, [applyEntry])

  // ---- page operations ----
  const ops = useMemo(() => {
    const run = (next, storeBefore = {}, storeAfter = {}) => {
      api.push({ type: "pages", beforePages: pagesRef.current, afterPages: next, storeBefore, storeAfter })
      for (const [id, objects] of Object.entries(storeAfter)) store.current.set(id, objects)
      api.setPagesBoth(next)
      api.recount()
      setSelection(null)
    }
    const find = (id) => pagesRef.current.findIndex((p) => p.id === id)
    return {
      rotate(id, clockwise) {
        const list = pagesRef.current
        const i = find(id)
        const page = list[i]
        const before = store.current.get(id) ?? []
        const rotated = rotateObjects(before, clockwise, dispSize(page))
        run(list.map((p) => (p.id === id ? { ...p, extra: (p.extra + (clockwise ? 90 : 270)) % 360 } : p)), { [id]: before }, { [id]: rotated })
      },
      duplicate(id) {
        const list = pagesRef.current
        const i = find(id)
        const copy = { ...list[i], id: uid() }
        const objects = clone(store.current.get(id) ?? [])
        run([...list.slice(0, i + 1), copy, ...list.slice(i + 1)], {}, { [copy.id]: objects })
      },
      insertBlank(afterId) {
        const list = pagesRef.current
        const i = find(afterId)
        const size = dispSize(list[i])
        const blank = { id: uid(), source: null, blank: true, base: { w: size.w, h: size.h }, baseRotate: 0, extra: 0 }
        run([...list.slice(0, i + 1), blank, ...list.slice(i + 1)])
      },
      remove(id) {
        const list = pagesRef.current
        if (list.length <= 1) return flash("A PDF needs at least one page.")
        run(list.filter((p) => p.id !== id))
      },
      move(id, dir) {
        const list = [...pagesRef.current]
        const i = find(id)
        const j = i + dir
        if (j < 0 || j >= list.length) return
        ;[list[i], list[j]] = [list[j], list[i]]
        run(list)
      },
      reorder(from, to) {
        const list = [...pagesRef.current]
        const [item] = list.splice(from, 1)
        list.splice(to, 0, item)
        run(list)
      },
    }
  }, [api, flash])

  const goToPage = useCallback(
    (id) => {
      pageEls.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
      setCurrentId(id)
    },
    [pageEls]
  )
  const stepPage = (d) => {
    const i = pagesRef.current.findIndex((p) => p.id === currentId)
    const next = pagesRef.current[Math.min(pagesRef.current.length - 1, Math.max(0, i + d))]
    if (next) goToPage(next.id)
  }

  // ---- keyboard ----
  useEffect(() => {
    if (hidden) return
    const onKey = (e) => {
      if (signatureOpen || confirmClose || warn) return
      const tag = e.target?.tagName
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      if (mod && !typing && (key === "z" || key === "y")) {
        e.preventDefault()
        return key === "y" || e.shiftKey ? redo() : undo()
      }
      if (typing || (mod && !["d", "c", "v"].includes(key))) return
      const editing = [...canvases.current.values()].some((c) => c.getActiveObject()?.isEditing)
      if (editing) return
      if (mod) {
        e.preventDefault()
        if (key === "d") api.duplicateSelected()
        if (key === "c") api.copySelected()
        if (key === "v") api.paste()
        return
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (latest.current.selection) {
          e.preventDefault()
          api.removeSelected()
        }
      } else if (e.key === "Escape") {
        if (latest.current.tool !== "select") setTool("select")
        else canvases.current.forEach((c) => (c.discardActiveObject(), c.requestRenderAll()))
      } else if (e.key.startsWith("Arrow") && latest.current.selection) {
        e.preventDefault()
        const d = e.shiftKey ? 10 : 1
        api.nudge(e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0, e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0)
      } else if (SHORTCUTS[key] && !e.altKey) {
        setTool(SHORTCUTS[key])
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hidden, signatureOpen, confirmClose, warn, undo, redo, api, setTool])

  // ---- save ----
  const pagesChanged = useMemo(
    () => doc != null && (pages.length !== doc.numPages || pages.some((p, i) => p.blank || p.source !== i || p.extra !== 0)),
    [pages, doc]
  )
  const canSave = !!doc && (editCount > 0 || pagesChanged)

  async function handleSave() {
    canvases.current.forEach((c) => {
      const a = c.getActiveObject()
      if (a?.isEditing) a.exitEditing()
      c.discardActiveObject()
    })
    await new Promise((r) => setTimeout(r, 40))
    const annotations = []
    const bad = new Set()
    for (let i = 0; i < pagesRef.current.length; i++) {
      const objs = store.current.get(pagesRef.current[i].id) ?? []
      if (!objs.length) continue
      const live = await util.enlivenObjects(objs)
      for (const o of live) {
        const ann = toAnnotation(o, i)
        if (!ann) continue
        annotations.push(ann)
        if (ann.type === "TEXT") unsupportedChars(ann.text).forEach((c) => bad.add(c))
      }
    }
    const payload = {
      annotations,
      pages: pagesRef.current.map((p) => ({
        source: p.blank ? null : p.source,
        blank: !!p.blank,
        width: p.blank ? Math.round(p.base.w * 100) / 100 : null,
        height: p.blank ? Math.round(p.base.h * 100) / 100 : null,
        rotation: p.extra,
      })),
    }
    if (bad.size) return setWarn({ chars: [...bad], payload })
    onSave(payload)
  }

  const requestClose = () => (editCount > 0 || pagesChanged ? setConfirmClose(true) : onChangeFile())

  // ---- derived UI state ----
  const group = selection ? groupOf(selection.kind) : (TOOL_GROUP[tool] ?? null)
  const pageNo = Math.max(1, pages.findIndex((p) => p.id === currentId) + 1)
  const hint = tool === "place" ? "Click where you want to place it on the page · Esc to cancel" : tool !== "select" ? TOOL_HINTS[tool] : null
  const ready = !!doc

  return (
    <div className={cn("fixed inset-0 z-[70] flex flex-col bg-muted text-foreground", hidden && "hidden")} role="region" aria-label="PDF editor">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-2 sm:px-3">
        <Button type="button" variant="ghost" size="icon" onClick={requestClose} disabled={saving} aria-label="Close editor">
          <X />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setShowThumbs((v) => !v)} aria-pressed={showThumbs} aria-label="Toggle page thumbnails" title="Pages">
          <PanelLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{file.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {ready ? `${pages.length} ${pages.length === 1 ? "page" : "pages"}` : "Opening…"}
            {editCount > 0 && ` · ${editCount} ${editCount === 1 ? "edit" : "edits"}`}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={undo} disabled={!hist.undo} aria-label="Undo" title="Undo (Ctrl+Z)">
          <Undo2 />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={redo} disabled={!hist.redo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
          <Redo2 />
        </Button>
        <Button type="button" className="ml-1" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? <LoaderCircle className="animate-spin" /> : <Download />}
          <span className="hidden sm:inline">Save &amp; download</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </header>

      {/* Tools + properties */}
      <div className="shrink-0 border-b border-border bg-card">
        <ToolBar tool={tool} setTool={setTool} onImage={chooseImage} onSignature={() => setSignatureOpen(true)} />
        <div className="border-t border-border/70 bg-muted/40">
          <PropertiesBar
            group={group}
            style={style}
            change={api.changeStyle}
            hasSelection={!!selection}
            hint="Select an item to edit it, or choose a tool above."
            actions={{ forward: () => api.reorderZ(true), backward: () => api.reorderZ(false), duplicate: api.duplicateSelected, remove: api.removeSelected }}
          />
        </div>
      </div>
      <input ref={imageInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={onImageFile} />

      {/* Workspace */}
      <div className="relative flex min-h-0 flex-1">
        {showThumbs && doc && (
          <aside className="absolute inset-y-0 left-0 z-30 w-40 overflow-y-auto border-r border-border bg-card shadow-lg md:static md:w-44 md:shadow-none" aria-label="Page thumbnails">
            <Thumbnails pages={pages} doc={doc} currentId={currentId} counts={counts} onGo={goToPage} ops={ops} />
          </aside>
        )}

        <div className="relative min-w-0 flex-1">
          <div ref={scrollRoot} className="absolute inset-0 overflow-auto" onPointerDown={(e) => e.target === e.currentTarget && canvases.current.forEach((c) => (c.discardActiveObject(), c.requestRenderAll()))}>
            {!doc ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> Opening your PDF…
              </div>
            ) : (
              <div className="flex min-w-max flex-col items-center gap-5 px-4 pt-5 pb-28">
                {pages.map((p) => (
                  <PageView key={p.id} page={p} doc={doc} scale={scale} tool={tool} brushColor={style.color} brushWidth={style.strokeWidth} api={api} />
                ))}
              </div>
            )}
          </div>

          {/* Hints and notices */}
          <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col items-center gap-2 px-3">
            {hint && (
              <p className="flex items-center gap-2 rounded-full bg-foreground/90 px-3.5 py-1.5 text-xs font-medium text-background shadow-lg">
                <Info className="size-3.5 shrink-0" /> {hint}
              </p>
            )}
            {(notice || preparing) && (
              <p role="status" className="flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-xs font-medium shadow-lg ring-1 ring-border">
                {preparing && <LoaderCircle className="size-3.5 animate-spin" />}
                {preparing ? "Preparing image…" : notice}
              </p>
            )}
            {error && (
              <p role="alert" className="pointer-events-auto flex max-w-lg items-start gap-2 rounded-2xl bg-destructive px-4 py-2.5 text-sm font-medium text-white shadow-lg">
                <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
              </p>
            )}
          </div>

          {/* Page + zoom pill */}
          {doc && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-card p-1 shadow-lg ring-1 ring-border">
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => stepPage(-1)} disabled={pageNo <= 1} aria-label="Previous page">
                <ChevronLeft />
              </Button>
              <span className="min-w-16 text-center text-sm font-medium tabular-nums" aria-live="polite">
                {pageNo} / {pages.length}
              </span>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => stepPage(1)} disabled={pageNo >= pages.length} aria-label="Next page">
                <ChevronRight />
              </Button>
              <span className="mx-1 h-5 w-px bg-border" aria-hidden />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => changeZoom(1 / 1.15)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
                <Minus />
              </Button>
              <button type="button" onClick={() => setZoom(1)} className="min-w-12 rounded-lg px-1 py-1 text-center text-sm font-medium tabular-nums hover:bg-muted" title="Fit to width" aria-label="Fit to width">
                {Math.round(scale * 100)}%
              </button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => changeZoom(1.15)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
                <Plus />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setShowThumbs((v) => !v)} aria-pressed={showThumbs} aria-label="Toggle page thumbnails">
                <PanelLeft />
              </Button>
            </div>
          )}
        </div>
      </div>

      {signatureOpen && (
        <SignatureDialog
          onClose={() => setSignatureOpen(false)}
          onUse={(data) => {
            setSignatureOpen(false)
            api.startPlace({ ...data, kind: "signature" })
          }}
        />
      )}

      {confirmClose && (
        <Modal
          title="Discard your changes?"
          onClose={() => setConfirmClose(false)}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setConfirmClose(false)}>
                Keep editing
              </Button>
              <Button type="button" variant="destructive" onClick={onChangeFile}>
                Discard and close
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">Your edits haven&apos;t been saved. Closing the editor will remove them.</p>
        </Modal>
      )}

      {warn && (
        <Modal
          title="Some characters can’t be saved"
          onClose={() => setWarn(null)}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setWarn(null)}>
                Go back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const payload = warn.payload
                  setWarn(null)
                  onSave(payload)
                }}
              >
                Save anyway
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            Standard PDF fonts only support Latin letters, numbers and common punctuation. These characters will be left out:
          </p>
          <p className="mt-3 rounded-xl bg-muted px-3 py-2 font-mono text-lg tracking-widest">{warn.chars.join(" ")}</p>
        </Modal>
      )}
    </div>
  )
}
