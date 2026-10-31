"use client"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error stopped this page from loading. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
