import { Point, util } from "fabric"

export const ACCENT = "#16a34a"

/** Fabric properties we need to keep when an object is serialised. */
export const PERSIST = ["kind", "fontKey", "mime"]

export const FONTS = [
  { id: "helvetica", label: "Sans", css: "Helvetica, Arial, sans-serif" },
  { id: "times", label: "Serif", css: '"Times New Roman", Times, serif' },
  { id: "courier", label: "Mono", css: '"Courier New", Courier, monospace' },
]
export const fontCss = (id) => (FONTS.find((f) => f.id === id) ?? FONTS[0]).css
export const fontKeyFromCss = (css = "") => {
  const c = css.toLowerCase()
  if (c.includes("courier") || c.includes("mono")) return "courier"
  if (c.includes("times") || c.includes("serif") && !c.includes("sans")) return "times"
  return "helvetica"
}

export const SWATCHES = ["#111827", "#dc2626", "#ea580c", "#16a34a", "#2563eb", "#7c3aed", "#ffffff"]
export const HIGHLIGHTS = ["#fde047", "#86efac", "#f9a8d4", "#93c5fd", "#fdba74"]

export const DEFAULT_STYLE = {
  fontFamily: "helvetica",
  fontSize: 16,
  bold: false,
  italic: false,
  underline: false,
  align: "left",
  color: "#111827",
  fill: null, // shape fill, null = none
  strokeWidth: 2,
  opacity: 1,
  whiteout: "#ffffff",
  highlight: "#fde047",
}

/** Applied to every object so selection handles look the same everywhere. */
export const OBJECT_DEFAULTS = {
  transparentCorners: false,
  cornerColor: "#ffffff",
  cornerStrokeColor: ACCENT,
  cornerStyle: "circle",
  cornerSize: 11,
  touchCornerSize: 30,
  borderColor: ACCENT,
  borderScaleFactor: 1.5,
  padding: 3,
  snapAngle: 15,
  snapThreshold: 6,
  lockScalingFlip: true,
}

export const kindOf = (obj) => obj?.kind ?? (obj?.type === "image" ? "image" : obj?.type === "rect" ? "shape" : "text")

/** Kinds that are exported as vector paths. */
export const PATH_KINDS = new Set(["drawing", "line", "arrow", "check", "cross"])

/** Which property group the toolbar shows for a kind. */
export function groupOf(kind) {
  if (kind === "text") return "text"
  if (kind === "shape" || kind === "ellipse") return "shape"
  if (PATH_KINDS.has(kind)) return "stroke"
  if (kind === "highlight") return "highlight"
  if (kind === "whiteout") return "whiteout"
  if (kind === "image") return "image"
  if (kind === "multi") return "multi"
  return null
}

export const TOOL_GROUP = {
  text: "text",
  edittext: "text",
  draw: "stroke",
  line: "stroke",
  arrow: "stroke",
  check: "stroke",
  cross: "stroke",
  rect: "shape",
  ellipse: "shape",
  highlight: "highlight",
  whiteout: "whiteout",
}

// ---- Style <-> object ----

export function readStyle(obj) {
  const kind = kindOf(obj)
  const out = { opacity: obj.opacity ?? 1 }
  if (kind === "text") {
    Object.assign(out, {
      fontFamily: obj.fontKey ?? fontKeyFromCss(obj.fontFamily),
      fontSize: Math.round(obj.fontSize * (obj.scaleY ?? 1)),
      bold: obj.fontWeight === "bold" || Number(obj.fontWeight) >= 600,
      italic: obj.fontStyle === "italic",
      underline: !!obj.underline,
      align: obj.textAlign ?? "left",
      color: obj.fill,
    })
  } else if (kind === "shape" || kind === "ellipse") {
    Object.assign(out, {
      color: obj.stroke || "#111827",
      strokeWidth: obj.strokeWidth ?? 0,
      fill: obj.fill && obj.fill !== "transparent" ? obj.fill : null,
    })
  } else if (PATH_KINDS.has(kind)) {
    Object.assign(out, { color: obj.stroke, strokeWidth: obj.strokeWidth })
  } else if (kind === "highlight") {
    out.highlight = obj.fill
  } else if (kind === "whiteout") {
    out.whiteout = obj.fill
  }
  return out
}

export function applyStyle(obj, patch) {
  const kind = kindOf(obj)
  const set = {}
  if ("opacity" in patch) set.opacity = patch.opacity
  if (kind === "text") {
    if ("fontFamily" in patch) Object.assign(set, { fontFamily: fontCss(patch.fontFamily), fontKey: patch.fontFamily })
    if ("fontSize" in patch) set.fontSize = patch.fontSize
    if ("bold" in patch) set.fontWeight = patch.bold ? "bold" : "normal"
    if ("italic" in patch) set.fontStyle = patch.italic ? "italic" : "normal"
    if ("underline" in patch) set.underline = patch.underline
    if ("align" in patch) set.textAlign = patch.align
    if ("color" in patch) set.fill = patch.color
  } else if (kind === "shape" || kind === "ellipse") {
    if ("color" in patch) set.stroke = patch.color
    if ("strokeWidth" in patch) set.strokeWidth = patch.strokeWidth
    if ("fill" in patch) set.fill = patch.fill ?? "transparent"
  } else if (PATH_KINDS.has(kind)) {
    if ("color" in patch) set.stroke = patch.color
    if ("strokeWidth" in patch) set.strokeWidth = patch.strokeWidth
  } else if (kind === "highlight") {
    if ("highlight" in patch) set.fill = patch.highlight
  } else if (kind === "whiteout") {
    if ("whiteout" in patch) set.fill = patch.whiteout
  }
  obj.set(set)
  obj.setCoords()
}

/** Controls that make sense for each kind (text and images keep their proportions). */
export function decorate(obj) {
  obj.set(OBJECT_DEFAULTS)
  const kind = kindOf(obj)
  if (kind === "text" || kind === "image") {
    obj.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false })
  }
}

// ---- Pages ----

export const uid = () => Math.random().toString(36).slice(2, 10)

/** Size of a page as the user sees it, after any rotation they added. */
export function dispSize(page) {
  return page.extra % 180 ? { w: page.base.h, h: page.base.w } : { w: page.base.w, h: page.base.h }
}

/** Keep annotations where they were when the user rotates a page by 90 degrees. */
export function rotateObjects(objects, clockwise, size /* size before rotating */) {
  return objects.map((o) => {
    const left = o.left ?? 0
    const top = o.top ?? 0
    const [nl, nt] = clockwise ? [size.h - top, left] : [top, size.w - left]
    const angle = (((o.angle ?? 0) + (clockwise ? 90 : -90)) % 360 + 360) % 360
    return { ...o, left: nl, top: nt, angle }
  })
}

// ---- Text support ----

// Characters in WinAnsi (what the standard PDF fonts can draw).
const WIN_ANSI_EXTRA = new Set(
  [0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178]
)
export function unsupportedChars(text) {
  const bad = new Set()
  for (const ch of text) {
    const cp = ch.codePointAt(0)
    const ok = cp === 10 || cp === 13 || cp === 9 || (cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff) || WIN_ANSI_EXTRA.has(cp)
    if (!ok) bad.add(ch)
  }
  return [...bad]
}

// ---- Images ----

const MAX_IMAGE_EDGE = 1600

/** Read an image file, shrink it if it is huge and return a data URL. */
export function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("That image could not be read."))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("That image could not be loaded."))
      img.onload = () => {
        const isJpeg = file.type === "image/jpeg"
        const mime = isJpeg ? "image/jpeg" : "image/png"
        const k = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
        if (k === 1 && (file.type === "image/jpeg" || file.type === "image/png")) {
          return resolve({ src: reader.result, mime, w: img.naturalWidth, h: img.naturalHeight })
        }
        const c = document.createElement("canvas")
        c.width = Math.max(1, Math.round(img.naturalWidth * k))
        c.height = Math.max(1, Math.round(img.naturalHeight * k))
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height)
        resolve({ src: c.toDataURL(mime, 0.92), mime, w: c.width, h: c.height })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// ---- Export ----

const round = (n) => Math.round(n * 100) / 100
const normAngle = (a) => ((a % 360) + 360) % 360

function pathToAbsolute(obj) {
  const m = obj.calcTransformMatrix()
  const off = obj.pathOffset
  const pt = (x, y) => {
    const p = util.transformPoint(new Point(x - off.x, y - off.y), m)
    return `${round(p.x)} ${round(p.y)}`
  }
  const parts = []
  for (const cmd of obj.path) {
    const c = cmd[0].toUpperCase()
    if (c === "Z") parts.push("Z")
    else if (c === "M" || c === "L") parts.push(`${c} ${pt(cmd[1], cmd[2])}`)
    else if (c === "Q") parts.push(`Q ${pt(cmd[1], cmd[2])} ${pt(cmd[3], cmd[4])}`)
    else if (c === "C") parts.push(`C ${pt(cmd[1], cmd[2])} ${pt(cmd[3], cmd[4])} ${pt(cmd[5], cmd[6])}`)
  }
  return parts.join(" ")
}

function imageToDataUrl(obj, width) {
  const el = obj.getElement()
  const nw = el.naturalWidth || el.width
  const nh = el.naturalHeight || el.height
  const mime = obj.mime === "image/jpeg" ? "image/jpeg" : "image/png"
  const scale = Math.min(1, 1600 / Math.max(nw, nh))
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.round(nw * scale))
  c.height = Math.max(1, Math.round(nh * scale))
  c.getContext("2d").drawImage(el, 0, 0, c.width, c.height)
  return c.toDataURL(mime, 0.92)
}

/** Turn one Fabric object (in page points, top-left origin) into the API's annotation shape. */
export function toAnnotation(obj, pageIndex) {
  const kind = kindOf(obj)
  const width = obj.width * obj.scaleX
  const height = obj.height * obj.scaleY
  const base = {
    pageIndex,
    x: round(obj.left),
    y: round(obj.top),
    width: round(width),
    height: round(height),
    rotation: round(normAngle(obj.angle ?? 0)),
    opacity: round(obj.opacity ?? 1),
  }
  if (kind === "text") {
    if (!obj.text?.trim()) return null
    const fontSize = round(obj.fontSize * obj.scaleY)
    return {
      type: "TEXT",
      ...base,
      text: obj.text,
      fontSize,
      fontColor: obj.fill,
      fontFamily: obj.fontKey ?? fontKeyFromCss(obj.fontFamily),
      bold: obj.fontWeight === "bold" || Number(obj.fontWeight) >= 600,
      italic: obj.fontStyle === "italic",
      underline: !!obj.underline,
      align: obj.textAlign ?? "left",
      lineHeight: round(fontSize * 1.13 * (obj.lineHeight ?? 1.16)),
    }
  }
  if (kind === "whiteout") return { type: "WHITEOUT", ...base, fillColor: obj.fill || "#FFFFFF" }
  if (kind === "highlight") return { type: "HIGHLIGHT", ...base, fillColor: obj.fill || "#fde047" }
  if (kind === "shape" || kind === "ellipse") {
    const filled = obj.fill && obj.fill !== "transparent"
    return {
      type: kind === "ellipse" ? "ELLIPSE" : "SHAPE",
      ...base,
      fillColor: filled ? obj.fill : null,
      strokeColor: obj.stroke,
      strokeWidth: obj.strokeWidth ?? 0,
    }
  }
  if (PATH_KINDS.has(kind)) {
    return {
      type: "DRAWING",
      ...base,
      rotation: 0,
      pathData: pathToAbsolute(obj),
      strokeColor: obj.stroke,
      strokeWidth: obj.strokeWidth,
    }
  }
  if (kind === "image") return { type: "IMAGE", ...base, imageBase64: imageToDataUrl(obj, width) }
  return null
}
