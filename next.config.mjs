import { PHASE_PRODUCTION_BUILD } from "next/constants.js"

const isProd = process.env.NODE_ENV === "production"

export default function nextConfig(phase) {
  // Fallback to your deployed Azure URL if the env var isn't set
  const api =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://paperless-e0hpfnaahbd8ajbx.centralindia-01.azurewebsites.net/api/v1"
  const site = process.env.NEXT_PUBLIC_SITE_URL

  if (phase === PHASE_PRODUCTION_BUILD) {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.warn(
        `\n[config] NEXT_PUBLIC_API_BASE_URL not set in env. Defaulting to: ${api}\n`
      )
    }
    if (!site) {
      console.warn(
        "\n[seo] NEXT_PUBLIC_SITE_URL is not set. Canonical URLs and the sitemap will point at http://localhost:3000 until you set it.\n"
      )
    }
  }

  const apiOrigin = api ? new URL(api).origin : ""
  const https = (site ?? "").startsWith("https://")

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} https://api.cloudinary.com`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ")

  return {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,

    async redirects() {
      return [{ source: "/home", destination: "/", permanent: true }]
    },

    async headers() {
      const common = [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ]
      const prodOnly = isProd
        ? [
            { key: "Content-Security-Policy", value: csp },
            { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          ]
        : []
      return [{ source: "/:path*", headers: [...common, ...prodOnly] }]
    },
  }
}