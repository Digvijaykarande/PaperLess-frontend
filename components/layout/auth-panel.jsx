import { Check } from "lucide-react"

import { getTool } from "@/lib/tools"

const TILES = ["merge", "compress", "protect", "pdf-to-word"].map(getTool)

const POINTS = [
  "Merge, split, rotate and reorder pages",
  "Convert to and from Word, Excel and PowerPoint",
  "Compress, watermark and password-protect",
]

/** Decorative side panel for the auth pages (desktop only). */
export function AuthPanel({ title, text }) {
  return (
    <aside
      className="relative hidden overflow-hidden bg-primary-soft/60 p-12 lg:flex lg:flex-col lg:justify-between"
      style={{ backgroundImage: "radial-gradient(#16a34a26 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }}
    >
      <div className="max-w-md">
        <h2 className="text-4xl leading-tight font-extrabold">{title}</h2>
        <p className="mt-3 text-lg text-muted-foreground">{text}</p>
      </div>

      <div className="relative mx-auto my-10 grid w-full max-w-sm grid-cols-2 gap-4" aria-hidden="true">
        {TILES.map((tool, i) => {
          const Icon = tool.icon
          return (
            <div
              key={tool.slug}
              className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${i % 2 ? "translate-y-6" : ""}`}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-strong">
                <Icon className="size-5" />
              </span>
              <p className="mt-3 font-heading text-sm font-semibold">{tool.name}</p>
              <div className="mt-2 h-1.5 w-2/3 rounded-full bg-muted" />
            </div>
          )
        })}
      </div>

      <ul className="space-y-3">
        {POINTS.map((p) => (
          <li key={p} className="flex items-center gap-3 text-sm font-medium">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3.5" />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </aside>
  )
}
