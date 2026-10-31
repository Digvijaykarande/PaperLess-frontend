import { Check } from "lucide-react"

import { Faq } from "@/components/common/faq"

/** Server-rendered, crawlable copy under the tool: intro, steps, notes and FAQs. */
export function ToolContent({ seo, faqs }) {
  return (
    <div className="mt-12 space-y-12">
      <section>
        <p className="text-base leading-relaxed text-muted-foreground">{seo.intro}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold">{seo.how}</h2>
        <ol className="mt-4 space-y-3">
          {seo.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed sm:text-base">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold">Good to know</h2>
        <ul className="mt-4 space-y-2.5">
          {seo.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <Check className="mt-1 size-4 shrink-0 text-primary-strong" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">Frequently asked questions</h2>
        <div className="mt-4">
          <Faq items={faqs} />
        </div>
      </section>
    </div>
  )
}
