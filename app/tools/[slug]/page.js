import Link from "next/link"
import { notFound } from "next/navigation"

import { JsonLd, faqSchema } from "@/components/common/json-ld"
import { ToolCard } from "@/components/common/tool-card"
import { SiteShell } from "@/components/layout/site-shell"
import { ToolContent } from "@/components/pages/tools/tool-content"
import { ToolWorkspace } from "@/components/pages/tools/tool-workspace"
import { MAX_FILE_MB, SITE, absoluteUrl } from "@/lib/site"
import { COMMON_FAQS, TOOL_SEO } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo"
import { TOOLS, getRelatedTools, getTool } from "@/lib/tools"

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const slug = (await params).slug
  const tool = getTool(slug)
  const seo = TOOL_SEO[slug]
  if (!tool || !seo) return {}
  return pageMeta({ title: seo.title, description: seo.description, path: `/tools/${slug}` })
}

export default async function ToolPage({ params }) {
  const slug = (await params).slug
  const tool = getTool(slug)
  const seo = TOOL_SEO[slug]
  if (!tool || !seo) notFound()
  const Icon = tool.icon
  const faqs = [...seo.faqs, ...COMMON_FAQS]
  const url = absoluteUrl(`/tools/${slug}`)

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url,
    description: seo.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: SITE.name, url: absoluteUrl("/") },
  }
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
      { "@type": "ListItem", position: 3, name: tool.name, item: url },
    ],
  }

  return (
    <SiteShell>
      <JsonLd data={appSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema(faqs)} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link> /{" "}
          <Link href="/tools" className="hover:text-foreground">Tools</Link> /{" "}
          <span className="text-foreground">{tool.name}</span>
        </nav>

        <div className="mt-6 flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
            <Icon className="size-6" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">{seo.h1}</h1>
            <p className="text-muted-foreground">{tool.summary}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card">
          <ToolWorkspace slug={tool.slug} />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Free, no account needed. Up to {MAX_FILE_MB} MB per file.{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            How we handle your files
          </Link>
        </p>

        <ToolContent seo={seo} faqs={faqs} />

        <h2 className="mt-14 text-xl font-bold">More tools</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {getRelatedTools(tool, 4).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
        <p className="mt-6 text-sm">
          <Link href="/tools" className="font-semibold text-primary-strong hover:underline">
            See all {TOOLS.length} PDF tools
          </Link>
        </p>
      </div>
    </SiteShell>
  )
}
