"use client"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { HeroVisual } from "@/components/pages/home/hero-visual"
import { TOOLS } from "@/lib/tools"
import { useEffect } from "react"

const POINTS = [
  "No account or sign-up needed",
  "Works on any device, nothing to install",
  `${TOOLS.length} tools in one place`,
]

export function Hero() {
  useEffect(() => {
    fetch(
      "https://paperless-e0hpfnaahbd8ajbx.centralindia-01.azurewebsites.net/"
    )
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error))
  },[])

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
            Free online PDF tools, without the paperwork.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Merge, split, compress and convert PDFs in seconds. Pick a tool,
            drop in your file and download the result.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tools" className={buttonVariants({ size: "lg" })}>
              Explore all tools
            </Link>
            <Link
              href="/tools/merge"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Merge PDFs
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}
