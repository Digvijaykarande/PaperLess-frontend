import Link from "next/link"

import { Logo } from "@/components/common/logo"

const COLUMNS = [
  {
    title: "Popular tools",
    links: [
      { href: "/tools/merge", label: "Merge PDF" },
      { href: "/tools/split", label: "Split PDF" },
      { href: "/tools/compress", label: "Compress PDF" },
      { href: "/tools/pdf-to-word", label: "PDF to Word" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/home#how-it-works", label: "How it works" },
      { href: "/tools/protect", label: "Protect PDF" },
      { href: "/tools/watermark", label: "Add watermark" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 pb-8 sm:px-6 md:grid-cols-[1.3fr_2fr] md:gap-12">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Simple PDF tools that run in your browser. Pick a tool, add a file, download the result.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-heading text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PaperLess. All rights reserved.</p>
          <p>Build by :- Digvijay Karande</p>
          <p>Made for people who’d rather not print it.</p>
        </div>
      </div>
    </footer>
  )
}