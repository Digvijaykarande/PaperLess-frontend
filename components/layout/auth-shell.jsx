import Link from "next/link"

import { Logo } from "@/components/common/logo"
import { AuthPanel } from "@/components/layout/auth-panel"

export function AuthShell({ title, description, footer, panelTitle, panelText, children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <main className="flex flex-col px-4 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
        <Link href="/" className="text-center text-sm font-medium text-primary-strong hover:underline">
          Back to PaperLess
        </Link>
      </main>
      <AuthPanel title={panelTitle} text={panelText} />
    </div>
  )
}
