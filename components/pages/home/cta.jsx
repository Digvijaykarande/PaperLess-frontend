import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export function Cta() {
  return (
    <section className="defer-render mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-foreground p-8 text-background sm:flex-row sm:items-center sm:p-12">
        <div>
          <h2 className="text-3xl font-bold">Got a PDF waiting?</h2>
          <p className="mt-2 max-w-md text-background/70">Pick a tool and have it sorted in under a minute.</p>
        </div>
        <Link href="/tools" className={buttonVariants({ size: "lg" })}>
          Choose a tool
        </Link>
      </div>
    </section>
  )
}
