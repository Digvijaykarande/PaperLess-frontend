"use client"

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  BringToFront,
  Check,
  Circle,
  Copy,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pencil,
  PenLine,
  Plus,
  SendToBack,
  Square,
  TextCursorInput,
  Trash2,
  Type,
  Underline,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FONTS, HIGHLIGHTS, SWATCHES } from "./editor-core"

export const TOOL_LIST = [
  { id: "select", label: "Select", icon: MousePointer2, key: "V" },
  { id: "edittext", label: "Edit text", icon: TextCursorInput, key: "E", hint: "Click any text in the PDF to change it" },
  { id: "text", label: "Add text", icon: Type, key: "T", hint: "Click anywhere on the page to type" },
  { id: "draw", label: "Draw", icon: Pencil, key: "P", hint: "Draw freehand on the page" },
  { id: "highlight", label: "Highlight", icon: Highlighter, key: "H", hint: "Drag over text to highlight it" },
  { id: "whiteout", label: "Whiteout", icon: Eraser, key: "W", hint: "Drag to cover something with a solid box" },
]
export const SHAPE_LIST = [
  { id: "rect", label: "Rectangle", icon: Square, key: "R" },
  { id: "ellipse", label: "Ellipse", icon: Circle, key: "O" },
  { id: "line", label: "Line", icon: Minus, key: "L" },
  { id: "arrow", label: "Arrow", icon: MoveUpRight, key: "A" },
  { id: "check", label: "Tick", icon: Check, key: "K" },
  { id: "cross", label: "Cross", icon: X, key: "X" },
]
export const TOOL_HINTS = Object.fromEntries([...TOOL_LIST, ...SHAPE_LIST].map((t) => [t.id, t.hint ?? "Drag on the page to draw it"]))

function ToolButton({ tool, active, onClick, compact }) {
  const Icon = tool.icon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={`${tool.label}${tool.key ? ` (${tool.key})` : ""}`}
      className={cn(
        "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 text-[0.8rem] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className="size-[18px]" />
      {!compact && <span className="hidden xl:inline">{tool.label}</span>}
    </button>
  )
}

export function ToolBar({ tool, setTool, onImage, onSignature }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5 [scrollbar-width:none]" role="toolbar" aria-label="Editing tools">
      {TOOL_LIST.map((t) => (
        <ToolButton key={t.id} tool={t} active={tool === t.id} onClick={() => setTool(t.id)} />
      ))}
      <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />
      {SHAPE_LIST.map((t) => (
        <ToolButton key={t.id} tool={t} active={tool === t.id} onClick={() => setTool(t.id)} compact />
      ))}
      <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />
      <ToolButton tool={{ id: "image", label: "Image", icon: ImageIcon }} active={tool === "place"} onClick={onImage} />
      <ToolButton tool={{ id: "sign", label: "Sign", icon: PenLine }} active={false} onClick={onSignature} />
    </div>
  )
}

// ---------- properties ----------

function Group({ label, children }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {label && <span className="text-xs font-semibold text-muted-foreground">{label}</span>}
      {children}
    </div>
  )
}

function Colors({ value, onChange, colors = SWATCHES, label, none }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {none && (
        <button
          type="button"
          role="radio"
          aria-checked={value == null}
          aria-label="No fill"
          title="None"
          onClick={() => onChange(null)}
          className={cn("relative size-6 rounded-full border border-border bg-white", value == null && "ring-2 ring-primary ring-offset-1")}
        >
          <span className="absolute inset-x-0.5 top-1/2 h-px -rotate-45 bg-destructive" />
        </button>
      )}
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value?.toLowerCase() === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn("size-6 rounded-full border border-black/15", value?.toLowerCase() === c && "ring-2 ring-primary ring-offset-1")}
          style={{ background: c }}
        />
      ))}
      <label className="relative size-6 cursor-pointer overflow-hidden rounded-full border border-border" title="Custom colour">
        <span className="absolute inset-0 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" />
        <input type="color" aria-label={`${label ?? "Colour"}: custom`} value={value ?? "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
      </label>
    </div>
  )
}

function Stepper({ value, onChange, min, max, step = 1, label, suffix }) {
  const clamp = (v) => Math.min(max, Math.max(min, v))
  return (
    <div className="flex items-center gap-0.5">
      <Button type="button" variant="outline" size="icon-sm" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(clamp(value - step))}>
        <Minus />
      </Button>
      <input
        type="number"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => e.target.value !== "" && onChange(clamp(Number(e.target.value)))}
        className="h-8 w-12 rounded-lg border border-border bg-card text-center text-sm tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      <Button type="button" variant="outline" size="icon-sm" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(clamp(value + step))}>
        <Plus />
      </Button>
    </div>
  )
}

function Toggle({ on, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn("flex size-8 items-center justify-center rounded-lg border border-border", on ? "bg-primary-soft text-primary-strong ring-1 ring-primary" : "bg-card hover:bg-muted")}
    >
      {children}
    </button>
  )
}

function Opacity({ value, onChange }) {
  return (
    <Group label="Opacity">
      <input type="range" min={10} max={100} step={5} value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} aria-label="Opacity" className="h-1.5 w-20 accent-[#16a34a]" />
      <span className="w-9 text-xs tabular-nums text-muted-foreground">{Math.round(value * 100)}%</span>
    </Group>
  )
}

export function PropertiesBar({ group, style, change, hasSelection, hint, actions }) {
  return (
    <div className="flex min-h-12 items-center gap-x-4 overflow-x-auto px-3 py-1.5 [scrollbar-width:none]" aria-label="Properties">
      {group === "text" && (
        <>
          <Group>
            <select
              aria-label="Font"
              value={style.fontFamily}
              onChange={(e) => change({ fontFamily: e.target.value })}
              className="h-8 rounded-lg border border-border bg-card px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </Group>
          <Stepper label="Font size" value={Math.round(style.fontSize)} min={6} max={144} onChange={(v) => change({ fontSize: v })} />
          <Group>
            <Toggle label="Bold" on={style.bold} onClick={() => change({ bold: !style.bold })}>
              <Bold className="size-4" />
            </Toggle>
            <Toggle label="Italic" on={style.italic} onClick={() => change({ italic: !style.italic })}>
              <Italic className="size-4" />
            </Toggle>
            <Toggle label="Underline" on={style.underline} onClick={() => change({ underline: !style.underline })}>
              <Underline className="size-4" />
            </Toggle>
          </Group>
          <Group>
            <Toggle label="Align left" on={style.align === "left"} onClick={() => change({ align: "left" })}>
              <AlignLeft className="size-4" />
            </Toggle>
            <Toggle label="Align centre" on={style.align === "center"} onClick={() => change({ align: "center" })}>
              <AlignCenter className="size-4" />
            </Toggle>
            <Toggle label="Align right" on={style.align === "right"} onClick={() => change({ align: "right" })}>
              <AlignRight className="size-4" />
            </Toggle>
          </Group>
          <Colors label="Text colour" value={style.color} onChange={(c) => change({ color: c })} />
          {hasSelection && <Opacity value={style.opacity} onChange={(v) => change({ opacity: v })} />}
        </>
      )}

      {group === "shape" && (
        <>
          <Group label="Outline">
            <Colors label="Outline colour" value={style.color} onChange={(c) => change({ color: c })} />
          </Group>
          <Group label="Width">
            <Stepper label="Outline width" value={style.strokeWidth} min={0} max={20} onChange={(v) => change({ strokeWidth: v })} />
          </Group>
          <Group label="Fill">
            <Colors label="Fill colour" none value={style.fill} onChange={(c) => change({ fill: c })} />
          </Group>
          {hasSelection && <Opacity value={style.opacity} onChange={(v) => change({ opacity: v })} />}
        </>
      )}

      {group === "stroke" && (
        <>
          <Colors label="Pen colour" value={style.color} onChange={(c) => change({ color: c })} />
          <Group label="Width">
            <Stepper label="Pen width" value={style.strokeWidth} min={1} max={30} onChange={(v) => change({ strokeWidth: v })} />
          </Group>
          {hasSelection && <Opacity value={style.opacity} onChange={(v) => change({ opacity: v })} />}
        </>
      )}

      {group === "highlight" && (
        <>
          <Group label="Colour">
            <Colors label="Highlight colour" colors={HIGHLIGHTS} value={style.highlight} onChange={(c) => change({ highlight: c })} />
          </Group>
          {hasSelection && <Opacity value={style.opacity} onChange={(v) => change({ opacity: v })} />}
        </>
      )}

      {group === "whiteout" && (
        <Group label="Fill">
          <Colors label="Cover colour" colors={["#ffffff", "#f3f4f6", "#fef9c3", "#111827"]} value={style.whiteout} onChange={(c) => change({ whiteout: c })} />
        </Group>
      )}

      {(group === "image" || group === "multi") && <Opacity value={style.opacity} onChange={(v) => change({ opacity: v })} />}

      {!group && <p className="text-sm text-muted-foreground">{hint}</p>}

      {hasSelection && (
        <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={actions.forward} aria-label="Bring forward" title="Bring forward">
            <BringToFront />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={actions.backward} aria-label="Send backward" title="Send backward">
            <SendToBack />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={actions.duplicate} aria-label="Duplicate" title="Duplicate (Ctrl+D)">
            <Copy />
          </Button>
          <Button type="button" variant="destructive" size="icon-sm" onClick={actions.remove} aria-label="Delete" title="Delete (Del)">
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  )
}
