import { Check } from "lucide-react"

import { LogoMark } from "@/components/common/logo"

function Lines({ rows = 5 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-2 rounded-full bg-muted" style={{ width: `${100 - ((i * 17) % 40)}%` }} />
      ))}
    </div>
  )
}

const SHEET = "absolute top-6 left-1/2 -ml-[90px] h-[300px] w-[180px] rounded-2xl border border-border bg-card p-5 shadow-sm"

/** Decorative: three sheets fan out once on load. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-[460px]" aria-hidden="true">
      <div className={`${SHEET} sheet-left`}>
        <Lines rows={7} />
      </div>
      <div className={`${SHEET} sheet-right`}>
        <Lines rows={6} />
      </div>
      <div className={`${SHEET} z-10 border-primary/30`}>
        <div className="mb-4 flex items-center justify-between">
          <LogoMark className="size-7" />
          <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">PDF</span>
        </div>
        <Lines rows={8} />
      </div>

      <div className="absolute bottom-6 left-0 z-20 flex items-center gap-2.5 rounded-2xl border border-border bg-card py-2.5 pr-4 pl-2.5 shadow-sm">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" />
        </span>
        <span className="text-left">
          <span className="block text-sm font-semibold">Merged and ready</span>
          <span className="block text-xs text-muted-foreground">3 files into 1 PDF</span>
        </span>
      </div>
    </div>
  )
}
