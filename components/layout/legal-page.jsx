import { SiteShell } from "@/components/layout/site-shell"
import { LEGAL_UPDATED } from "@/lib/site"

export function LegalPage({ title, intro, updated = true, children }) {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-bold">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted-foreground">Last updated: {LEGAL_UPDATED}</p>}
        {intro && <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        <div className="mt-10 space-y-10">{children}</div>
      </article>
    </SiteShell>
  )
}

export function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function List({ items }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-primary">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}
