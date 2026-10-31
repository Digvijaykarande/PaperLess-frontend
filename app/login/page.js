import Link from "next/link"
import { notFound } from "next/navigation"

import { AUTH_ENABLED } from "@/lib/site"
import { AuthShell } from "@/components/layout/auth-shell"
import { LoginForm } from "@/components/pages/login/login-form"

export const metadata = { title: "Sign in", robots: { index: false, follow: false } }

export default function LoginPage() {
  if (!AUTH_ENABLED) notFound()

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your PaperLess account."
      panelTitle="Your PDF toolbox, ready when you are."
      panelText="Pick up where you left off with every tool in one place."
      footer={<>New here? <Link href="/register" className="font-semibold text-primary-strong hover:underline">Create an account</Link></>}
    >
      <LoginForm />
    </AuthShell>
  )
}
