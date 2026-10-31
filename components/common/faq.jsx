import { ChevronDown } from "lucide-react"

/** Native <details> keeps the answers in the HTML for search engines and works without JavaScript. */
export function Faq({ items }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map(({ q, a }) => (
        <details key={q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-heading text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
            {q}
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  )
}
