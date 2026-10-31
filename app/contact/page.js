import { LegalPage, List, Section } from "@/components/layout/legal-page"
import { SITE } from "@/lib/site"
import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Contact PaperLess",
  description: "Get in touch with PaperLess to report a bug, ask a question or share feedback about our free PDF tools.",
  path: "/contact",
})

export default function ContactPage() {
  return (
    <LegalPage title="Contact" updated={false} intro="Questions, bug reports and ideas are all welcome.">
      <Section title="Email">
        <p>
          Write to{" "}
          <a href={`mailto:${SITE.email}`} className="font-semibold text-primary-strong hover:underline">
            {SITE.email}
          </a>
          . We aim to reply within a few working days.
        </p>
      </Section>
      <Section title="Helpful details for a bug report">
        <List
          items={[
            "The tool you were using, for example Merge PDF.",
            "What you expected to happen and what happened instead.",
            "Your browser and device.",
            "Please don't send sensitive documents by email.",
          ]}
        />
      </Section>
    </LegalPage>
  )
}
