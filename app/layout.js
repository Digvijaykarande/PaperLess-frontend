import { Bricolage_Grotesque, Figtree } from "next/font/google"

import { SITE } from "@/lib/site"

import "./globals.css"

const sans = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})
const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
})

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: "/",
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/og", width: 1200, height: 630, alt: `${SITE.name}: free online PDF tools` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16a34a",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${heading.variable}`}>
      <body>{children}</body>
    </html>
  )
}
