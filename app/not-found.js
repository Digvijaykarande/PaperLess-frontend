import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">We can’t find that page</h1>
      <p className="text-muted-foreground">The link may be old, or the tool may have moved.</p>
      <Link href="/tools" className={buttonVariants()}>Browse all tools</Link>
    </main>
  )
}
