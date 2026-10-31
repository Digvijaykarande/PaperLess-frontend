import Link from "next/link"

import { Logo } from "@/components/common/logo"
import { AUTH_ENABLED, SITE } from "@/lib/site"
import { CATEGORIES, TOOLS } from "@/lib/tools"

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  ...(AUTH_ENABLED
    ? [
        { href: "/login", label: "Sign in" },
        { href: "/register", label: "Create account" },
      ]
    : []),
]

const COLUMNS = [
  ...CATEGORIES.map((cat) => ({
    title: cat.label,
    links: TOOLS.filter((t) => t.category === cat.id).map((t) => ({ href: `/tools/${t.slug}`, label: t.name })),
  })),
  { title: "PaperLess", links: [{ href: "/tools", label: "All tools" }, ...COMPANY] },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-8 sm:px-6 lg:grid-cols-[1.1fr_3fr] lg:gap-12">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Free online PDF tools. Pick a tool, add a file, download the result.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
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
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Built by {SITE.author}</p>
          <p>Made for people who’d rather not print it.</p>
        </div>
      </div>
    </footer>
  )
}
