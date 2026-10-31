import Link from "next/link"

import { SectionHeading } from "@/components/common/section-heading"
import { CATEGORIES, TOOLS } from "@/lib/tools"

/** Plain, crawlable list of every tool grouped by category: strong internal linking for the homepage. */
export function AllTools() {
  return (
    <section className="defer-render mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        title="Every PDF tool in one place"
        description="Organize, convert, improve and secure your documents without installing anything."
      />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <h3 className="font-heading text-base font-semibold">{cat.label}</h3>
            <ul className="mt-3 space-y-3">
              {TOOLS.filter((t) => t.category === cat.id).map((t) => (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="group block outline-none focus-visible:underline">
                    <span className="text-sm font-medium group-hover:text-primary-strong group-hover:underline">
                      {t.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">{t.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
