import Link from "next/link"

export function ToolCard({ tool }) {
  const Icon = tool.icon
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="dog-ear group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary-strong">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block font-heading text-base font-semibold">{tool.name}</span>
        <span className="mt-1 block text-sm leading-snug text-muted-foreground">
          {tool.summary}
        </span>
      </span>
    </Link>
  )
}
