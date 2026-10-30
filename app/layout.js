import { Bricolage_Grotesque, Figtree } from "next/font/google"

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
  title: { default: "PaperLess: PDF tools that stay out of your way", template: "%s · PaperLess" },
  description: "Merge, split, compress and convert PDFs in your browser.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${heading.variable}`}>
      <body>{children}</body>
    </html>
  )
}
