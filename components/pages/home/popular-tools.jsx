import Link from "next/link"

import { SectionHeading } from "@/components/common/section-heading"
import { ToolCard } from "@/components/common/tool-card"
import { buttonVariants } from "@/components/ui/button"
import { TOOLS, getFeaturedTools } from "@/lib/tools"

export function PopularTools() {
  return (
    <section className="defer-render border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title="The tools people reach for most" description="Each one does a single job, and does it well." />
          <Link href="/tools" className={buttonVariants({ variant: "outline" })}>
            See all {TOOLS.length} tools
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {getFeaturedTools().map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
