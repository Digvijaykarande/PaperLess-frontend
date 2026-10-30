import Link from "next/link"
import { notFound } from "next/navigation"

import { ToolCard } from "@/components/common/tool-card"
import { SiteShell } from "@/components/layout/site-shell"
import { ToolWorkspace } from "@/components/pages/tools/tool-workspace"
import { TOOLS, getRelatedTools, getTool } from "@/lib/tools"

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const tool = getTool((await params).slug)
  return tool ? { title: tool.name, description: tool.summary } : {}
}

export default async function ToolPage({ params }) {
  const tool = getTool((await params).slug)
  if (!tool) notFound()
  const Icon = tool.icon

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/home" className="hover:text-foreground">Home</Link> /{" "}
          <Link href="/tools" className="hover:text-foreground">Tools</Link> /{" "}
          <span className="text-foreground">{tool.name}</span>
        </nav>

        <div className="mt-6 flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
            <Icon className="size-6" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="text-muted-foreground">{tool.summary}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card">
          <ToolWorkspace slug={tool.slug} />
        </div>

        <h2 className="mt-14 text-xl font-bold">More tools</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {getRelatedTools(tool, 4).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </div>
    </SiteShell>
  )
}
