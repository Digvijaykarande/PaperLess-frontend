import Link from "next/link"

import { AuthShell } from "@/components/layout/auth-shell"
import { RegisterForm } from "@/components/pages/register/register-form"

export const metadata = { title: "Create account" }

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="It takes less than a minute."
      panelTitle="Everything you do with PDFs, in one tab."
      panelText="Create a free account and start with any of the tools."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-primary-strong hover:underline">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthShell>
  )
}
