"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/common/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/lib/auth"

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pw, setPw] = useState("")
  const score = [pw.length >= 8, /[A-Z]/.test(pw) && /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length

  async function onSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get("password").length < 8) return setError("Use at least 8 characters for your password.")
    if (data.get("password") !== data.get("confirm")) return setError("The two passwords don’t match.")
    setLoading(true)
    setError(null)
    try {
      await register(data.get("name"), data.get("email"), data.get("password"))
      router.push("/login")
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
        {pw && (
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= score ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{["Too short", "Weak", "Okay", "Good", "Strong"][score]}</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <LoaderCircle className="animate-spin" />} Create account
      </Button>
    </form>
  )
}
