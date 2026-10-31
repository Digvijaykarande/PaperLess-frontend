import { JsonLd, faqSchema } from "@/components/common/json-ld"
import { SiteShell } from "@/components/layout/site-shell"
import { AllTools } from "@/components/pages/home/all-tools"
import { Cta } from "@/components/pages/home/cta"
import { Hero } from "@/components/pages/home/hero"
import { HomeFaq } from "@/components/pages/home/home-faq"
import { HowItWorks } from "@/components/pages/home/how-it-works"
import { PopularTools } from "@/components/pages/home/popular-tools"
import { HOME_FAQS } from "@/lib/seo-content"
import { SITE, absoluteUrl } from "@/lib/site"
import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({ description: SITE.description, path: "/" })

export default function HomePage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon.svg"),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: absoluteUrl("/"),
      description: SITE.description,
    },
    faqSchema(HOME_FAQS),
  ]

  return (
    <SiteShell>
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <Hero />
      <PopularTools />
      <HowItWorks />
      <AllTools />
      <HomeFaq />
      <Cta />
    </SiteShell>
  )
}
