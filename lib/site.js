/**
 * Single source of truth for site-wide settings.
 * Everything that changes between local, staging and production comes from env vars.
 */
export const SITE = {
  name: "PaperLess",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  title: "PaperLess: Free Online PDF Tools to Merge, Split & Compress",
  description:
    "Free online PDF tools: merge, split, compress, rotate, protect and convert PDF to Word, Excel and images. Fast, simple and nothing to install.",
  author: "Digvijay Karande",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com",
}

/** Sign-in and register stay hidden until the backend auth endpoints exist. */
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true"

/** Keep this in step with the backend and your Cloudinary plan. */
export const MAX_FILE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_MB ?? 10)

/** How long uploaded and processed files live. The backend cleanup job must match this. */
export const RETENTION_HOURS = Number(process.env.NEXT_PUBLIC_FILE_RETENTION_HOURS ?? 1)
export const RETENTION_LABEL = `${RETENTION_HOURS} ${RETENTION_HOURS === 1 ? "hour" : "hours"}`

export const LEGAL_UPDATED = "31 October 2026"

export const absoluteUrl = (path = "/") => `${SITE.url}${path}`
