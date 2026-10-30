import { SiteShell } from "@/components/layout/site-shell"
import { Cta } from "@/components/pages/home/cta"
import { Hero } from "@/components/pages/home/hero"
import { HowItWorks } from "@/components/pages/home/how-it-works"
import { PopularTools } from "@/components/pages/home/popular-tools"

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <PopularTools />
      <HowItWorks />
      <Cta />
    </SiteShell>
  )
}
