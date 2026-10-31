import { JsonLd } from "@/components/common/json-ld"
import { SiteShell } from "@/components/layout/site-shell"
import { ToolsCatalog } from "@/components/pages/tools/tools-catalog"
import { absoluteUrl } from "@/lib/site"
import { pageMeta } from "@/lib/seo"
import { TOOLS } from "@/lib/tools"

export const metadata = pageMeta({
  title: "All PDF Tools: Merge, Split, Compress, Convert",
  description:
    "Browse every free PaperLess PDF tool: merge, split, rotate, compress, protect, unlock, watermark and convert PDF to Word, Excel and images.",
  path: "/tools",
})

export default function ToolsPage() {
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: absoluteUrl(`/tools/${t.slug}`),
    })),
  }

  return (
    <SiteShell>
      <JsonLd data={listSchema} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-bold sm:text-5xl">All PDF tools</h1>
        <p className="mt-3 mb-8 max-w-xl text-lg text-muted-foreground">
          Everything you need to work with PDFs, in one place. All free, no account needed.
        </p>
        <ToolsCatalog />
      </div>
    </SiteShell>
  )
}
