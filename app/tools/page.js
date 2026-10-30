import { SiteShell } from "@/components/layout/site-shell"
import { ToolsCatalog } from "@/components/pages/tools/tools-catalog"

export const metadata = { title: "All PDF tools" }

export default function ToolsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-bold sm:text-5xl">All PDF tools</h1>
        <p className="mt-3 mb-8 max-w-xl text-lg text-muted-foreground">
          Everything you need to work with PDFs, in one place.
        </p>
        <ToolsCatalog />
      </div>
    </SiteShell>
  )
}
