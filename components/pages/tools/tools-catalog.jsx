"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { ToolCard } from "@/components/common/tool-card"
import { Input } from "@/components/ui/input"
import { CATEGORIES, TOOLS } from "@/lib/tools"
import { cn } from "@/lib/utils"

export function ToolsCatalog() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOLS.filter(
      (t) =>
        (category === "all" || t.category === category) &&
        (!q || t.name.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q))
    )
  }, [query, category])

  const tabs = [{ id: "all", label: "All tools" }, ...CATEGORIES]

  return (
    <div>
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools, like merge or PDF to Word"
          aria-label="Search tools"
          className="pl-10"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={category === tab.id}
            onClick={() => setCategory(tab.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
              category === tab.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {results.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          No tools match “{query}”. Try a different word, or clear the filter.
        </p>
      )}
    </div>
  )
}
