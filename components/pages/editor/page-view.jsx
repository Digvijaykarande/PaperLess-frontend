"use client"

import { memo, useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { Canvas, Ellipse, IText, Path, PencilBrush, Rect } from "fabric"

import { decorate, dispSize, fontCss, fontKeyFromCss, kindOf } from "./editor-core"

export const DRAG_TOOLS = new Set(["rect", "ellipse", "highlight", "whiteout", "line", "arrow", "check", "cross"])
const MIN_DRAG = 4

// ---------- text under the cursor (for "Edit text") ----------

/** Group PDF.js text items into editable line segments, in page points. */
function buildTextGroups(content, viewport) {
  const items = []
  for (const it of content.items) {
    if (!it.str || !it.str.trim()) continue
    const tx = pdfjsLib.Util.transform(viewport.transform, it.transform)
    const fs = Math.hypot(tx[0], tx[1])
    if (Math.abs(tx[1]) > 0.01 || tx[0] <= 0 || tx[3] >= 0 || fs < 3) continue // upright text only
    const style = content.styles[it.fontName] ?? {}
    const asc = style.ascent && style.ascent > 0.5 && style.ascent < 1.3 ? style.ascent : 0.9
    const desc = style.descent && style.descent < 0 && style.descent > -0.5 ? style.descent : -0.22
    items.push({
      str: it.str,
      fontName: it.fontName,
      generic: style.fontFamily ?? "",
      x: tx[4],
      base: tx[5],
      w: it.width * viewport.scale,
      fs,
      asc,
      desc,
    })
  }
  items.sort((a, b) => (Math.abs(a.base - b.base) > 2 ? a.base - b.base : a.x - b.x))
  const groups = []
  for (const it of items) {
    const g = groups[groups.length - 1]
    const gap = g ? it.x - (g.x + g.w) : 0
    if (g && Math.abs(g.base - it.base) <= Math.max(2, g.fs * 0.3) && gap < g.fs * 0.9 && gap > -g.fs) {
      g.text += (gap > g.fs * 0.15 && !g.text.endsWith(" ") ? " " : "") + it.str
      g.w = it.x + it.w - g.x
      g.fs = Math.max(g.fs, it.fs)
    } else {
      groups.push({ ...it, text: it.str })
    }
  }
  return groups.map((g) => ({
    ...g,
    top: g.base - g.asc * g.fs,
    height: (g.asc - g.desc) * g.fs,
  }))
}

/** Background and text colours of a region of the rendered page. */
function sampleColors(pdfCanvas, pageW, box) {
  try {
    const k = pdfCanvas.width / pageW
    const x = Math.max(0, Math.floor(box.x * k))
    const y = Math.max(0, Math.floor(box.y * k))
    const w = Math.max(1, Math.min(pdfCanvas.width - x, Math.ceil(box.w * k)))
    const h = Math.max(1, Math.min(pdfCanvas.height - y, Math.ceil(box.h * k)))
    const d = pdfCanvas.getContext("2d").getImageData(x, y, w, h).data
    const counts = new Map()
    const q = (v) => v >> 3
    for (let i = 0; i < d.length; i += 4) {
      const key = (q(d[i]) << 10) | (q(d[i + 1]) << 5) | q(d[i + 2])
      const e = counts.get(key)
      if (e) e.n++
      else counts.set(key, { n: 1, rgb: [d[i], d[i + 1], d[i + 2]] })
    }
    let best = 0
    let bg = [255, 255, 255]
    for (const e of counts.values()) if (e.n > best) ((best = e.n), (bg = e.rgb))
    if (bg.every((v) => v >= 244)) bg = [255, 255, 255]
    let far = 0
    let fg = [17, 24, 39]
    for (let i = 0; i < d.length; i += 4) {
      const dist = Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2])
      if (dist > far) ((far = dist), (fg = [d[i], d[i + 1], d[i + 2]]))
    }
    const hex = (c) => "#" + c.map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("")
    return { bg: hex(bg), fg: far > 60 ? hex(fg) : "#111827" }
  } catch {
    return { bg: "#ffffff", fg: "#111827" }
  }
}

// ---------- shape builders ----------

const arrowHead = (x1, y1, x2, y2, size) => {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const p = (da) => `${x2 - size * Math.cos(a + da)} ${y2 - size * Math.sin(a + da)}`
  return ` M ${p(0.45)} L ${x2} ${y2} L ${p(-0.45)}`
}

function pathFor(tool, a, b, strokeWidth, snap) {
  let { x: x2, y: y2 } = b
  if (tool === "line" || tool === "arrow") {
    if (snap) {
      const ang = Math.round(Math.atan2(y2 - a.y, x2 - a.x) / (Math.PI / 4)) * (Math.PI / 4)
      const len = Math.hypot(x2 - a.x, y2 - a.y)
      x2 = a.x + len * Math.cos(ang)
      y2 = a.y + len * Math.sin(ang)
    }
    let d = `M ${a.x} ${a.y} L ${x2} ${y2}`
    if (tool === "arrow") d += arrowHead(a.x, a.y, x2, y2, Math.max(9, strokeWidth * 4.5))
    return d
  }
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  const w = Math.max(Math.abs(b.x - a.x), 1)
  const h = Math.max(Math.abs(b.y - a.y), 1)
  if (tool === "check") return `M ${x + w * 0.05} ${y + h * 0.55} L ${x + w * 0.38} ${y + h} L ${x + w} ${y}`
  return `M ${x} ${y} L ${x + w} ${y + h} M ${x + w} ${y} L ${x} ${y + h}` // cross
}

const DEFAULT_DRAG_SIZE = {
  rect: [120, 70],
  ellipse: [110, 70],
  highlight: [150, 16],
  whiteout: [150, 26],
  line: [110, 0],
  arrow: [110, 0],
  check: [26, 26],
  cross: [26, 26],
}

function buildShape(tool, a, b, style, snap = false) {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  const w = Math.abs(b.x - a.x)
  const h = Math.abs(b.y - a.y)
  if (tool === "rect" || tool === "ellipse") {
    const common = {
      fill: style.fill ?? "transparent",
      stroke: style.color,
      strokeWidth: style.strokeWidth,
      strokeUniform: true,
      kind: tool === "rect" ? "shape" : "ellipse",
    }
    return tool === "rect"
      ? new Rect({ left: x, top: y, width: Math.max(w, 1), height: Math.max(h, 1), ...common })
      : new Ellipse({ left: x, top: y, rx: Math.max(w, 1) / 2, ry: Math.max(h, 1) / 2, ...common })
  }
  if (tool === "highlight") {
    return new Rect({ left: x, top: y, width: Math.max(w, 1), height: Math.max(h, 1), fill: style.highlight, opacity: 0.45, kind: "highlight" })
  }
  if (tool === "whiteout") {
    return new Rect({
      left: x,
      top: y,
      width: Math.max(w, 1),
      height: Math.max(h, 1),
      fill: style.whiteout,
      stroke: "#cbd5e1",
      strokeWidth: 1,
      strokeDashArray: [4, 3],
      strokeUniform: true,
      kind: "whiteout",
    })
  }
  return new Path(pathFor(tool, a, b, style.strokeWidth, snap), {
    fill: null,
    stroke: style.color,
    strokeWidth: style.strokeWidth,
    strokeUniform: true,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    kind: tool,
  })
}

// ---------- the page ----------

export const PageView = memo(function PageView({ page, doc, scale, tool, brushColor, brushWidth, api }) {
  const size = dispSize(page)
  const wrapRef = useRef(null)
  const pdfRef = useRef(null)
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const groupsRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [rendered, setRendered] = useState(0)
  const [groups, setGroups] = useState([])

  // Only mount heavy canvases for pages near the screen.
  useEffect(() => {
    const el = wrapRef.current
    api.pageEls.set(page.id, el)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      root: api.scrollRoot.current,
      rootMargin: "1000px 0px",
    })
    io.observe(el)
    return () => {
      io.disconnect()
      api.pageEls.delete(page.id)
    }
  }, [api, page.id])

  // ---- Fabric canvas for this page ----
  useEffect(() => {
    if (!visible) return
    const slot = document.createElement("div")
    const el = document.createElement("canvas")
    slot.appendChild(el)
    hostRef.current.appendChild(slot)
    const canvas = new Canvas(el, { preserveObjectStacking: true, selection: true, uniformScaling: false, stopContextMenu: true })
    canvas._loading = true
    canvas.freeDrawingBrush = new PencilBrush(canvas)
    canvas.freeDrawingBrush.decimate = 0.6
    canvasRef.current = canvas
    api.registerCanvas(page.id, canvas)
    let disposed = false

    const commit = () => {
      if (canvas._loading || canvas._queued) return
      canvas._queued = true
      queueMicrotask(() => {
        canvas._queued = false
        if (!disposed) api.commit(page.id, canvas)
      })
    }
    canvas.commitNow = commit

    canvas.loadFromJSON({ objects: api.getStore(page.id) }).then(() => {
      if (disposed) return
      canvas.getObjects().forEach(decorate)
      canvas._loading = false
      canvas.requestRenderAll()
      setReady(true)
    })

    let drawing = null
    let start = null
    const L = () => api.latest.current

    canvas.on("object:added", (e) => {
      if (!canvas._loading) decorate(e.target)
    })
    canvas.on("before:transform", (e) => {
      canvas.uniformScaling = kindOf(e.transform?.target) === "image"
    })
    canvas.on("object:modified", ({ target }) => {
      if (target && kindOf(target) === "text" && (target.scaleX !== 1 || target.scaleY !== 1)) {
        target.set({ fontSize: Math.max(4, Math.round(target.fontSize * Math.max(target.scaleX, target.scaleY))), scaleX: 1, scaleY: 1 })
        target.setCoords()
      }
      commit()
    })
    canvas.on("text:editing:exited", ({ target }) => {
      if (target && !target.text?.trim()) {
        canvas._loading = true
        canvas.remove(target)
        canvas._loading = false
      }
      commit()
    })
    canvas.on("path:created", ({ path }) => {
      const s = L().style
      path.set({ kind: "drawing", stroke: s.color, strokeWidth: s.strokeWidth, fill: null, strokeUniform: true, strokeLineCap: "round", strokeLineJoin: "round" })
      decorate(path)
      commit()
    })
    for (const ev of ["selection:created", "selection:updated", "selection:cleared"]) {
      canvas.on(ev, () => api.onSelection(page.id, canvas))
    }

    canvas.on("mouse:down", (opt) => {
      api.setActivePage(page.id)
      const { tool: t, style } = L()
      const p = opt.scenePoint
      if (t === "place") return api.placePending(page.id, canvas, p)
      if (t === "text") {
        if (opt.target && kindOf(opt.target) === "text") {
          canvas.setActiveObject(opt.target)
          opt.target.enterEditing()
        } else if (!opt.target) {
          const txt = new IText("", {
            left: p.x,
            top: p.y - style.fontSize * 0.55,
            fontSize: style.fontSize,
            fontFamily: fontCss(style.fontFamily),
            fontKey: style.fontFamily,
            fontWeight: style.bold ? "bold" : "normal",
            fontStyle: style.italic ? "italic" : "normal",
            underline: style.underline,
            textAlign: style.align,
            fill: style.color,
            kind: "text",
          })
          canvas.add(txt)
          canvas.setActiveObject(txt)
          txt.enterEditing()
          api.setTool("select")
        }
        return
      }
      if (DRAG_TOOLS.has(t) && !opt.target) {
        start = { x: p.x, y: p.y }
        drawing = buildShape(t, start, start, style)
        canvas._loading = true
        canvas.add(drawing)
        canvas._loading = false
      }
    })
    canvas.on("mouse:move", (opt) => {
      if (!drawing) return
      const { tool: t, style } = L()
      const p = opt.scenePoint
      canvas._loading = true
      if (t === "rect" || t === "ellipse" || t === "highlight" || t === "whiteout") {
        const x = Math.min(start.x, p.x)
        const y = Math.min(start.y, p.y)
        const w = Math.max(Math.abs(p.x - start.x), 1)
        const h = Math.max(Math.abs(p.y - start.y), 1)
        if (t === "ellipse") drawing.set({ left: x, top: y, rx: w / 2, ry: h / 2 })
        else drawing.set({ left: x, top: y, width: w, height: h })
        drawing.setCoords()
      } else {
        canvas.remove(drawing)
        drawing = buildShape(t, start, p, style, opt.e.shiftKey)
        canvas.add(drawing)
      }
      canvas._loading = false
      canvas.requestRenderAll()
    })
    canvas.on("mouse:up", (opt) => {
      if (!drawing) return
      const { tool: t, style } = L()
      const p = opt.scenePoint
      const moved = Math.hypot(p.x - start.x, p.y - start.y)
      canvas._loading = true
      canvas.remove(drawing)
      let finalObj = drawing
      if (moved < MIN_DRAG) {
        const [dw, dh] = DEFAULT_DRAG_SIZE[t]
        finalObj = buildShape(t, { x: start.x, y: start.y }, { x: start.x + dw, y: start.y + dh }, style)
      }
      decorate(finalObj)
      canvas.add(finalObj)
      canvas._loading = false
      canvas.setActiveObject(finalObj)
      drawing = null
      start = null
      commit()
      api.setTool("select")
    })

    return () => {
      disposed = true
      api.registerCanvas(page.id, null)
      canvasRef.current = null
      setReady(false)
      canvas.dispose()
      slot.remove()
    }
  }, [visible, page.id, page.extra, api])

  // Keep the Fabric canvas matched to the zoomed page.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ready) return
    canvas.setDimensions({ width: Math.round(size.w * scale), height: Math.round(size.h * scale) })
    canvas.setZoom(scale)
    canvas.requestRenderAll()
  }, [ready, scale, size.w, size.h])

  // Switch the canvas behaviour with the active tool.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ready) return
    const select = tool === "select"
    canvas.isDrawingMode = tool === "draw"
    if (tool === "draw") {
      const brush = canvas.freeDrawingBrush
      if (brush) {
        brush.color = api.latest.current.style.color
        brush.width = api.latest.current.style.strokeWidth
      }
    }
    canvas.selection = select
    canvas.skipTargetFind = !(select || tool === "text")
    canvas.allowTouchScrolling = select
    canvas.defaultCursor = select ? "default" : tool === "text" ? "text" : "crosshair"
    canvas.hoverCursor = select ? "move" : tool === "text" ? "text" : "crosshair"
    if (!select && tool !== "text") canvas.discardActiveObject()
    canvas.requestRenderAll()
  }, [tool, ready, api])

  // Brush follows the style controls while drawing.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ready || tool !== "draw" || !canvas.freeDrawingBrush) return
    canvas.freeDrawingBrush.color = brushColor
    canvas.freeDrawingBrush.width = brushWidth
  }, [brushColor, brushWidth, tool, ready])

  // ---- Render the PDF page (off-screen, debounced, cancellable) ----
  useEffect(() => {
    if (!visible || page.blank) return
    let cancelled = false
    let task = null
    const timer = setTimeout(async () => {
      try {
        const pdfPage = await doc.getPage(page.source + 1)
        if (cancelled) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const k = Math.max(0.5, Math.min(scale * dpr, 4096 / size.w, 4096 / size.h))
        const viewport = pdfPage.getViewport({ scale: k, rotation: (page.baseRotate + page.extra) % 360 })
        const off = document.createElement("canvas")
        off.width = Math.floor(viewport.width)
        off.height = Math.floor(viewport.height)
        task = pdfPage.render({ canvasContext: off.getContext("2d", { willReadFrequently: false }), viewport })
        await task.promise
        if (cancelled) return
        const target = pdfRef.current
        target.width = off.width
        target.height = off.height
        target.getContext("2d").drawImage(off, 0, 0)
        setRendered((n) => n + 1)
      } catch (err) {
        if (err?.name !== "RenderingCancelledException" && !cancelled) console.warn("Page render failed", err)
      }
    }, 90)
    return () => {
      cancelled = true
      clearTimeout(timer)
      task?.cancel()
    }
  }, [doc, page.source, page.blank, page.baseRotate, page.extra, size.w, size.h, scale, visible])

  // Free memory when the page scrolls far away.
  useEffect(() => {
    if (visible) return
    const c = pdfRef.current
    if (c) {
      c.width = 0
      c.height = 0
    }
  }, [visible])

  // ---- Text groups for "Edit text" ----
  useEffect(() => {
    groupsRef.current = null
    setGroups([])
  }, [page.id, page.extra])

  useEffect(() => {
    if (tool !== "edittext" || !visible || page.blank) return
    if (groupsRef.current) return setGroups(groupsRef.current)
    let cancelled = false
    ;(async () => {
      const pdfPage = await doc.getPage(page.source + 1)
      const viewport = pdfPage.getViewport({ scale: 1, rotation: (page.baseRotate + page.extra) % 360 })
      const content = await pdfPage.getTextContent()
      if (cancelled) return
      groupsRef.current = buildTextGroups(content, viewport)
      setGroups(groupsRef.current)
    })()
    return () => {
      cancelled = true
    }
  }, [tool, visible, doc, page.source, page.blank, page.baseRotate, page.extra, page.id])

  async function editExisting(g) {
    const canvas = canvasRef.current
    if (!canvas) return
    let bold = /bold|black|heavy/i.test(g.fontName)
    let italic = /italic|oblique/i.test(g.fontName)
    let fontKey = fontKeyFromCss(g.generic)
    try {
      const pdfPage = await doc.getPage(page.source + 1)
      const f = pdfPage.commonObjs.has(g.fontName) ? pdfPage.commonObjs.get(g.fontName) : null
      const name = `${f?.name ?? ""} ${f?.loadedName ?? ""}`
      bold = bold || !!f?.bold || /bold|black|heavy/i.test(name)
      italic = italic || !!f?.italic || /italic|oblique/i.test(name)
      if (/courier|mono/i.test(name)) fontKey = "courier"
      else if (/times|serif|georgia|garamond|cambria/i.test(name) && !/sans/i.test(name)) fontKey = "times"
    } catch {
      /* fall back to the name-based guess */
    }
    const pad = 1.5
    const colors = pdfRef.current ? sampleColors(pdfRef.current, size.w, { x: g.x - pad, y: g.top, w: g.w + pad * 2, h: g.height }) : { bg: "#ffffff", fg: "#111827" }
    const cover = new Rect({
      left: g.x - pad,
      top: g.top - pad / 2,
      width: g.w + pad * 2,
      height: g.height + pad,
      fill: colors.bg,
      kind: "whiteout",
    })
    const txt = new IText(g.text, {
      left: g.x,
      top: g.base - g.fs * 0.879,
      fontSize: Math.round(g.fs * 10) / 10,
      fontFamily: fontCss(fontKey),
      fontKey,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      fill: colors.fg,
      kind: "text",
    })
    canvas._loading = true
    canvas.add(cover)
    canvas.add(txt)
    decorate(cover)
    decorate(txt)
    canvas._loading = false
    api.setTool("select")
    canvas.setActiveObject(txt)
    txt.enterEditing()
    txt.selectAll()
    canvas.requestRenderAll()
    canvas.commitNow?.()
  }

  const showBlank = page.blank || !rendered
  return (
    <div
      ref={wrapRef}
      data-page-id={page.id}
      className="relative mx-auto shrink-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.08)]"
      style={{ width: Math.round(size.w * scale), height: Math.round(size.h * scale) }}
    >
      <canvas ref={pdfRef} className="absolute inset-0 size-full" aria-hidden={showBlank} />
      <div ref={hostRef} className="absolute inset-0" />
      {tool === "edittext" && !page.blank && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {groups.map((g, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Edit text: ${g.text}`}
              onClick={() => editExisting(g)}
              className="pointer-events-auto absolute cursor-text rounded-[2px] bg-primary/5 outline-1 outline-primary/40 transition-colors hover:bg-primary/20 hover:outline-2 hover:outline-primary focus-visible:outline-2 focus-visible:outline-primary"
              style={{ left: g.x * scale - 2, top: g.top * scale - 1, width: g.w * scale + 4, height: g.height * scale + 2 }}
            />
          ))}
        </div>
      )}
    </div>
  )
})

